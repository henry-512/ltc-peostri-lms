import { aql, Database } from 'arangojs'
import { GeneratedAqlQuery } from 'arangojs/aql'
import {
    CollectionUpdateOptions,
    DocumentCollection,
} from 'arangojs/collection'
import { ArrayCursor } from 'arangojs/cursor'
import { QueryOptions } from 'arangojs/database'
import { config } from './config'
import { HTTPStatus, IErrorable } from './lms/errors'
import { IField } from './lms/FieldData'
import { IArangoIndexes } from './lms/types'
import {
    appendReturnFields,
    generateDBID,
    isDBKey,
    keyToId,
    splitId,
} from './lms/util'

export class ArangoWrapper<Type extends IArangoIndexes> extends IErrorable {
    // Set up database
    protected static db = new Database({
        url: config.dbUrl,
        databaseName: config.dbName,
        auth: { username: config.dbUser, password: config.dbPass },
    })

    protected collection: DocumentCollection<Type>
    protected getAllQueryFields: GeneratedAqlQuery

    private async existsUnsafe(id: string) {
        return this.collection.documentExists(id)
    }

    private async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    private async saveUnsafe(doc: Type) {
        return this.collection.save(doc, {
            overwriteMode: 'replace',
        })
    }

    private async updateUnsafe(doc: Type, opt: CollectionUpdateOptions) {
        return this.collection.update(doc._key as string, doc, opt)
    }

    private async removeUnsafe(id: string) {
        await this.collection.remove(id)
    }

    private idRegex
    public isDBId(id: string) {
        return this.idRegex.test(id)
    }
    public keyToId(key: string) {
        return keyToId(key, this.dbName)
    }
    public generateDBID() {
        return generateDBID(this.dbName)
    }
    public isKeyOrId(idOrKey: string) {
        return isDBKey(idOrKey) || this.idRegex.test(idOrKey)
    }
    public asId(idOrKey: string) {
        if (this.isDBId(idOrKey)) {
            return idOrKey
        } else if (isDBKey(idOrKey)) {
            return this.keyToId(idOrKey)
        } else {
            throw this.error(
                'asId',
                HTTPStatus.BAD_REQUEST,
                'Invalid document Id',
                `${idOrKey} is not an ID or key`
            )
        }
    }
    public asKey(idOrKey: string) {
        if (isDBKey(idOrKey)) {
            return idOrKey
        } else if (this.isDBId(idOrKey)) {
            return splitId(idOrKey).key
        } else {
            throw this.error(
                'asKey',
                HTTPStatus.BAD_REQUEST,
                'Invalid document Id',
                `${idOrKey} is not an ID or key`
            )
        }
    }

    constructor(private dbName: string, fields: [string, IField][]) {
        super(dbName)

        this.collection = ArangoWrapper.db.collection(this.dbName)
        this.getAllQueryFields = appendReturnFields(
            aql`id:z._key,`,
            fields
                .filter((d) => !d[1].hideGetAll && d[0] !== 'id')
                .map((d) => d[0])
        )

        this.idRegex = new RegExp(`^${dbName}\/([0-9]|[a-z]|[A-Z]|-|_)+$`)
    }

    protected getAllQuery(
        sort: ISortOpts,
        offset: number,
        count: number,
        filters: IFilterOpts[],
        justIds: boolean,
        raw: boolean
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${this.collection}`

        for (const filter of filters) {
            let k = filter.ref
                ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
                : aql`z.${filter.key}`
            if (filter.inArray) {
                query = aql`${query} FILTER ${filter.inArray} IN ${k}`
            }
            if (filter.eq !== undefined) {
                query = aql`${query} FILTER ${k} == ${filter.eq}`
            }
            if (filter.in !== undefined) {
                query = aql`${query} FILTER ${k} IN ${filter.in}`
            }
            if (filter.q !== undefined) {
                query = aql`${query} FILTER CONTAINS(${k},${filter.q})`
            }
        }

        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        query = aql`${query} ${
            sort.desc ? 'DESC' : 'ASC'
        } LIMIT ${offset}, ${count} RETURN`

        if (justIds) {
            query = aql`${query} z._id`
        } else if (raw) {
        } else {
            query = aql`${query} {${this.getAllQueryFields}}`
        }

        return query
    }

    public async queryGet(opts: IQueryGetOpts): Promise<{
        cursor: ArrayCursor<any>
        size: number
    }> {
        let query = this.getAllQuery(
            opts.sort ?? { desc: false, key: '_key' },
            opts.range.offset,
            opts.range.count,
            opts.filters,
            opts.justIds ?? false,
            opts.raw ?? false
        )

        let cursor = await ArangoWrapper.db.query(query, {
            fullCount: true,
        })

        let size =
            cursor.extra.stats?.fullCount ??
            (await this.collection.count()).count

        return { cursor, size }
    }

    public async queryGetCount(opts: IQueryGetOpts): Promise<number> {
        let query = this.getAllQuery(
            opts.sort ?? { desc: false, key: '_key' },
            opts.range.offset,
            opts.range.count,
            opts.filters,
            opts.justIds ?? false,
            opts.raw ?? false
        )

        let cursor = await ArangoWrapper.db.query(query, {
            count: true,
        })

        if (cursor.count === undefined) {
            throw this.internal('queryGetCount', '.count field missing')
        }

        return cursor.count ?? 0
    }

    public async tryExists(id: string) {
        return this.isDBId(id) && this.existsUnsafe(id)
    }

    public async tryKeyExists(key: string) {
        return isDBKey(key) && this.existsUnsafe(key)
    }

    public async exists(id: string) {
        if (!this.isDBId(id)) {
            throw this.error(
                'exists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] is not a valid id for this collection`
            )
        }
        return this.existsUnsafe(id)
    }

    public keyExists(key: string) {
        if (!isDBKey(key)) {
            throw this.error(
                'keyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${key}] is not a valid key for this collection`
            )
        }
        return this.existsUnsafe(key)
    }

    public async assertKeyExists(key: string) {
        if (!isDBKey(key)) {
            throw this.error(
                'keyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${key}] is not a valid key for this collection`
            )
        }
        let id = this.keyToId(key)
        if (!(await this.existsUnsafe(id))) {
            throw this.error(
                'assertKeyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${key}] dne in this collection`
            )
        }
        return id
    }

    public async assertIdExists(id: string) {
        if (!this.isDBId(id)) {
            throw this.error(
                'keyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] is not a valid id for this collection`
            )
        }
        if (!(await this.existsUnsafe(id))) {
            throw this.error(
                'assertKeyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] dne in this collection`
            )
        }
    }

    public async get(id: string) {
        if (!this.isDBId(id)) {
            throw this.error(
                'get',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] is not a valid id for this collection`
            )
        }
        if (!(await this.existsUnsafe(id))) {
            throw this.error(
                'get',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] DNE`
            )
        }

        let doc = await this.getUnsafe(id)

        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev

        return doc
    }

    public async save(doc: Type) {
        if (doc.id) {
            doc._key = this.asKey(doc.id)
            delete doc.id

            return this.saveUnsafe(doc)
        }

        throw this.internal('save', `${JSON.stringify(doc)} lacks id key`)
    }

    public async update(doc: Type, opt: CollectionUpdateOptions) {
        if (doc.id) {
            doc._key = this.asKey(doc.id)
            delete doc.id

            return this.updateUnsafe(doc, opt)
        }

        throw this.internal('save', `${JSON.stringify(doc)} lacks id key`)
    }

    public async remove(id: string) {
        if (this.isDBId(id)) {
            return this.removeUnsafe(id)
        }
        throw this.internal('delete', `${id} is not a valid Id`)
    }

    public async deleteOrphans(parentFieldLocal: string) {
        // Filters documents with parent fields that cannot be properly
        // dereferenced [DOCUMENT(d.parent) === null]
        return ArangoWrapper.db.query(
            aql`FOR d IN ${this.collection} FILTER DOCUMENT(d.${parentFieldLocal}) == null REMOVE d IN ${this.collection}`
        )
    }

    public async getAll(opts?: QueryOptions) {
        return ArangoWrapper.db.query(
            aql`FOR d in ${this.collection} RETURN d`,
            opts
        )
    }
}

export interface IFilterOpts {
    key: string
    // If true, REF is a key in the document referenced by key
    // Ie. {key:rank, ref:name, q:Admin} filters users with rank 'Admin'
    ref?: string
    // Complete checking
    in?: string[]
    // Substring check
    q?: string
    // Complete checking against single element
    eq?: string
    // Checks if the passed string is in the array target
    inArray?: string
}

export interface ISortOpts {
    desc: boolean
    key: string
    // If true, REF is a key in the document referenced by key
    ref?: string
}

export interface IQueryGetOpts {
    filters: IFilterOpts[]
    sort?: ISortOpts
    range: {
        offset: number
        count: number
    }
    justIds?: boolean
    raw?: boolean
}

export interface IGetAllQueryResults {
    all: any[]
    size: number
    low: number
    high: number
}
