import { aql, Database } from 'arangojs'
import { GeneratedAqlQuery } from 'arangojs/aql'
import { CollectionUpdateOptions, DocumentCollection } from 'arangojs/collection'
import { IFieldData } from './lms/FieldData'

import { config } from './config'
import { IArangoIndexes } from './lms/types'
import { appendReturnFields, generateDBID, keyToId } from './lms/util'
import { HTTPStatus, IErrorable } from './lms/errors'

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

    public async exists(id: string) {
        return this.collection.documentExists(id)
    }

    public async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    protected async saveUnsafe(doc: Type) {
        return this.collection.save(doc)
    }

    protected async updateUnsafe(doc: Type, opt: CollectionUpdateOptions) {
        return this.collection.update(doc._key as string, doc, opt)
    }

    protected async removeUnsafe(id: string) {
        await this.collection.remove(id)
    }

    private idRegex
    public isId(id: string) { return this.idRegex.test(id) }
    public keyToId(key: string) { return keyToId(key, this.dbName) }
    public generateDBID() { return generateDBID(this.dbName) }

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

    private getAllQuery(
        collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        queryFields: GeneratedAqlQuery,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${collection} SORT z.${sort} ${sortDir}`

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`
        }

        return aql`${query} LIMIT ${offset}, ${count} RETURN {${queryFields}}`
    }

    public async queryGet(
        opts: IQueryGetOpts
    ): Promise<{
        cursor: GeneratedAqlQuery,
        size: number,
    }> {
        return {
            cursor: this.getAllQuery(
                this.collection,
                aql`opts.sort.key` ?? ArangoWrapper.KEY,
                opts.sort?.dir === 'ASC' ? ArangoWrapper.ASC : ArangoWrapper.DESC,
                opts.range?.offset ?? 0,
                opts.range?.count ?? 10,
                this.getAllQueryFields,
                [],
            ),
            size: (await this.collection.count()).count,
        }
    }

    public async get(id: string) {
        if (!this.isId(id)) {
            throw this.error(
                'get',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] is not a valid id for this collection`
            )
        }
        if (!await this.exists(id)) {
            throw this.error(
                'get',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${id}] DNE`
            )
        }
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
