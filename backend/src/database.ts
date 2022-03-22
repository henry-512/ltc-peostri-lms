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
    static ASC = aql`ASC`
    static DESC = aql`DESC`
    static KEY = aql`_key`

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
                (d) => !d[1].hideGetAll
            ).map(
                (d) => d[0]
            )
        )

        this.idRegex = new RegExp(`^${dbName}\/([0-9]|[a-z]|[A-Z]|-|_)+$`)
    }

    protected getAllQuery(
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${this.collection} SORT z.${sort} ${sortDir}`

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`
        }

        return aql`${query} LIMIT ${offset}, ${count} RETURN {${this.getAllQueryFields}}`
    }

    public async queryGet(
        opts: IQueryGetOpts
    ): Promise<{
        cursor: ArrayCursor<any>,
        size: number,
    }> {
        let query = this.getAllQuery(
            opts.sort ? aql`${opts.sort.key}` : ArangoWrapper.KEY,
            opts.sort?.dir === 'ASC' ? ArangoWrapper.ASC : ArangoWrapper.DESC,
            opts.range?.offset ?? 0,
            opts.range?.count ?? 10,
            [],
        )

        return {
            cursor: await db.query(query),
            size: (await this.collection.count()).count,
        }
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

export interface IQueryGetOpts {
    filter?: {
        key:string,
        in?:any[],
    }[],
    sort?: {dir: 'ASC' | 'DESC', key: string},
    range: {
        offset: number,
        count: number,
    }
}
