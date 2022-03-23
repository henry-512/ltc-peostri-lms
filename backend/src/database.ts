import { aql, Database } from 'arangojs'
import { GeneratedAqlQuery } from 'arangojs/aql'
import { CollectionUpdateOptions, DocumentCollection } from 'arangojs/collection'
import { IFieldData } from './lms/FieldData'

import { config } from './config'
import { IArangoIndexes } from './lms/types'
import { appendReturnFields, generateDBID, isDBKey, keyToId } from './lms/util'
import { HTTPStatus, IErrorable } from './lms/errors'
import { ArrayCursor } from 'arangojs/cursor'

// Set up database
export const db = new Database({
    url: config.dbUrl,
    databaseName: config.dbName,
    auth: { username: config.dbUser, password: config.dbPass }
})

export class ArangoWrapper<Type extends IArangoIndexes> extends IErrorable {
    protected collection: DocumentCollection<Type>
    protected getAllQueryFields: GeneratedAqlQuery

    private async existsUnsafe(id: string) {
        return this.collection.documentExists(id)
    }

    private async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    public async saveUnsafe(doc: Type) {
        return this.collection.save(doc)
    }

    public async updateUnsafe(doc: Type, opt: CollectionUpdateOptions) {
        return this.collection.update(doc._key as string, doc, opt)
    }

    public async removeUnsafe(id: string) {
        await this.collection.remove(id)
    }

    private idRegex
    public isDBId(id: string) { return this.idRegex.test(id) }
    public keyToId(key: string) { return keyToId(key, this.dbName) }
    public generateDBID() { return generateDBID(this.dbName) }
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
                `${idOrKey} is not an ID or key`,
            )
        }
    }

    constructor(
        private dbName:string,
        fields: [string, IFieldData][]
    ) {
        super(dbName)

        this.collection = db.collection(this.dbName)
        this.getAllQueryFields = appendReturnFields(
            aql`id:z._key,`,
            fields.filter(
                (d) => !d[1].hideGetAll && d[0] !== 'id'
            ).map(
                (d) => d[0]
            )
        )

        this.idRegex = new RegExp(`^${dbName}\/([0-9]|[a-z]|[A-Z]|-|_)+$`)
    }

    protected getAllQuery(
		sort: ISortOpts,
		offset: number, 
		count: number,
        filters: IFilterOpts[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${this.collection}`

        for (const filter of filters) {
            let k = filter.ref
                ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
                : aql`z.${filter.key}`
            if (filter.in) {
                query = aql`${query} FILTER ${k} IN ${filter.in}`
            }
            if (filter.q) {
                query = aql`${query} FILTER CONTAINS(${k},${filter.q})`
            }
        }

        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        query = aql`${query} ${sort.desc ? 'DESC' : 'ASC'} LIMIT ${offset}, ${count} RETURN {${this.getAllQueryFields}}`

        return query
    }

    public async queryGet(
        opts: IQueryGetOpts
    ): Promise<{
        cursor: ArrayCursor<any>,
        size: number,
    }> {
        let query = this.getAllQuery(
            opts.sort ?? {desc:false, key:'_key'},
            opts.range.offset,
            opts.range.count,
            opts.filters || [],
        )

        let cursor = await db.query(query, {
            fullCount: true,
        })

        let size = cursor.extra.stats?.fullCount
            ?? (await this.collection.count()).count

        return { cursor, size }
    }

    public async tryExists(id: string) {
        return this.isDBId(id) && this.existsUnsafe(id)
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

    public async get(id: string) {
        if (!this.isDBId(id)) {
            throw this.error(
                'get',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] is not a valid id for this collection`
            )
        }
        if (!await this.existsUnsafe(id)) {
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
}

export interface IFilterOpts {
    key:string,
    // If true, REF is a key in the document referenced by key
    // Ie. {key:rank, ref:name, q:Admin} filters users with rank 'Admin'
    ref?:string,
    in?:string[],
    q?:string,
}

export interface ISortOpts {
    desc: boolean,
    key: string,
    // If true, REF is a key in the document referenced by key
    ref?: string,
}

export interface IQueryGetOpts {
    filters?: IFilterOpts[],
    sort?: ISortOpts,
    range: {
        offset: number,
        count: number,
    }
}
