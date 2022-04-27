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

/**
 * A wrapper for ArangoJS function calls to avoid directly using AQL syntax. This was done to more easily facilitate switching underlying database architecture.
 * 
 * The database configuration is established by config.ts.
 * 
 * Each ArangoWrapper instance manages a single collection in the database. Some functions run independent of the collection, but should always be associated with the data they are using.
 * 
 * Extends IErrorable to provide cleaner error handling.
 * 
 * Note: `ID`s are in the form `[collection]/[KEY]`, while `KEY`s lack the `[collection]` prefix. `ID`s are required for internal document relations but `KEY`s are more useful for the frontend (the collection prefix makes filtering and `/:id` routes more difficult).
 * 
 * @typeParam Type An interface for the data managed by this collection.
 */
export class ArangoWrapper<Type extends IArangoIndexes> extends IErrorable {
    // Set up database
    protected static db = new Database({
        url: config.dbUrl,
        databaseName: config.dbName,
        auth: { username: config.dbUser, password: config.dbPass },
    })

    // Internal collection
    protected collection: DocumentCollection<Type>
    /**
     * An AQL query representing the fields that should be return from a GET-ALL request.
     */
    protected getAllQueryFields: GeneratedAqlQuery

    /**
     * Check if the id exists in the collection.
     * @param id An ID for this collection
     * @return A Promise that resolves true if the document exists
     */
    private async existsUnsafe(id: string) {
        return this.collection.documentExists(id)
    }

    /**
     * Return a document from its ID
     * @param id An ID for this collection
     * @return A raw document from the database matching the ID.
     * @throws An error if the id is invalid
     */
    private async getUnsafe(id: string): Promise<Type> {
        return this.collection.document(id)
    }

    /**
     * Save a document in the database. `doc._key` is the collection primary key for upload.
     * @param A document for this collection
     */
    private async saveUnsafe(doc: Type) {
        return this.collection.save(doc, {
            overwriteMode: 'replace',
        })
    }

    /**
     * Updates the passed collection with the passed data. Uses the doc._key value to check what document to update.
     * @param doc An update document
     * @param opt A set of update options
     */
    private async updateUnsafe(doc: Type, opt: CollectionUpdateOptions) {
        return this.collection.update(doc._key as string, doc, opt)
    }

    /**
     * Removes the passed ID from the database.
     * @param id A valid ID for this collection
     */
    private async removeUnsafe(id: string) {
        await this.collection.remove(id)
    }

    /**
     * Regular Expression used to validate if a string as an ID for this collection
     */
    private idRegex
    /**
     *  Returns true if this looks like an `ID` for this collection
     * @param id A string to test
     * @return true if the string matches the ID regex
     */
    public isDBId(id: string) {
        return this.idRegex.test(id)
    }
    /**
     * Converts a key to an ID. Does not perform input checking.
     * @param key A `KEY`
     * @returns An `ID` for this collection
     */
    public keyToId(key: string) {
        return keyToId(key, this.dbName)
    }
    /**
     * Generates a DB `ID` for this collection.
     * @return An `ID` where they `KEY` section is a url-safe base-64 UUID.
     */
    public generateDBID() {
        return generateDBID(this.dbName)
    }
    /**
     * Returns true if the passed string is a `KEY` or an `ID`
     * @param idOrKey A string
     * @return True if idOrKey is either a `KEY` or an `ID` for this collection.
     */
    public isKeyOrId(idOrKey: string) {
        return isDBKey(idOrKey) || this.idRegex.test(idOrKey)
    }
    /**
     * Converts an id or a key into an `ID`.
     * @param idOrKey The string to convert
     * @returns An `ID` for this collection
     * @throws BAD_REQUEST if the string isn't an `ID` or `KEY`
     */
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
    /**
     * Converts an id or a key into a `KEY`.
     * @param idOrKey The string to convert
     * @returns A `KEY`
     * @throws BAD_REQUEST if the string isn't an `ID` or `KEY`
     */
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

    /**
     * Builds the collection manager from its string name and field data.
     */
    constructor(private dbName: string, fields: [string, IField][]) {
        // Build error handler
        super(dbName)

        // Set collection
        this.collection = ArangoWrapper.db.collection(this.dbName)
        // Generate AQL return query
        this.getAllQueryFields = appendReturnFields(
            aql`id:z._key,`,
            fields
                .filter((d) => !d[1].hideGetAll && d[0] !== 'id')
                .map((d) => d[0])
        )

        // Set regex
        this.idRegex = new RegExp(`^${dbName}\/([0-9]|[a-z]|[A-Z]|-|_)+$`)
    }

    /**
     * Converts a filter into its document key.
     * @param filter The filter to parse
     * @returns An AQL string to use for filtering 
     */
    protected getFilterKey(filter: IFilterOpts) {
        return filter.ref
            ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
            : aql`z.${filter.key}`
    }

    /**
     * Appends the return segment to the query.
     * @param query An AQL query to append to
     * @returns The finalized query
     */
    protected returnQuery(query: GeneratedAqlQuery) {
        return aql`${query} RETURN {${this.getAllQueryFields}}`
    }

    /**
     */
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
            // Support for custom keys
            let k = filter.custom ?? this.getFilterKey(filter)
            // Filter checkings
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
                if (
                    typeof filter.q === 'string' &&
                    filter.q.charAt(0) === '/'
                ) {
                    query = aql`${query} FILTER REGEX_TEST(${k},${filter.q.substring(
                        1
                    )},true)`
                } else {
                    query = aql`${query} FILTER CONTAINS(LOWER(${k}),LOWER(${filter.q}))`
                }
            }
            if (filter.intersect) {
                query = aql`${query} FILTER LENGTH(INTERSECTION(${k}, ${filter.intersect}))!=0`
            }
        }

        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        query = aql`${query} ${
            sort.desc ? 'DESC' : 'ASC'
        } LIMIT ${offset}, ${count}`

        if (justIds) {
            query = aql`${query} RETURN z._id`
        } else if (raw) {
            query = aql`${query} RETURN z`
        } else {
            query = this.returnQuery(query)
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

    public async update(doc: Type) {
        if (doc.id) {
            doc._key = this.asKey(doc.id)
            delete doc.id
        }
        if (doc._key) {
            return this.updateUnsafe(doc, {
                keepNull: false,
                mergeObjects: false,
            })
        }
        throw this.internal(
            'save',
            `${JSON.stringify(doc)} lacks id or _key key`
        )
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

    /**
     * Updates all `ids` with document(id)[key] = value
     * @param key
     */
    public async updateFaster(ids: string[], key: string, value: any) {
        let keys: string[] = ids.map((id) => this.asKey(id))
        return ArangoWrapper.db.query(
            aql`FOR k IN ${keys} UPDATE {_key:k} WITH{${key}:${value}} IN ${this.collection}`
        )
    }

    /**
     * @return An ArrayCursor of all updated ids
     */
    public async updateWithFilterFaster(
        fKey: string,
        fEq: any,
        key: string,
        value: any
    ): Promise<ArrayCursor<string>> {
        return ArangoWrapper.db.query(
            aql`FOR d IN ${this.collection} FILTER d.${fKey}==${fEq} FILTER d.${key}!=${value} UPDATE d WITH {${key}:${value}} IN ${this.collection} RETURN d._id`
        )
    }

    /**
     * Sets DOCUMENT(id).key = value
     */
    public async updateOneFaster(id: string, key: string, value: any) {
        let k = this.asKey(id)
        return ArangoWrapper.db.query(
            aql`UPDATE{_key:${k}}WITH{${key}:${value}}IN${this.collection}`
        )
    }

    public async getIds(ids: string[]): Promise<ArrayCursor<Type>> {
        return ArangoWrapper.db.query(aql`FOR i IN ${ids} RETURN DOCUMENT(i)`)
    }

    /**
     * @param ret Looks like `status`
     */
    public async getFaster<T>(
        ids: string[],
        ret: string
    ): Promise<ArrayCursor<T>> {
        return ArangoWrapper.db.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)RETURN d.${ret}`
        )
    }

    public async getOneFaster<T>(id: string, ret: string): Promise<T> {
        let cursor = await ArangoWrapper.db.query(
            aql`RETURN DOCUMENT(${id}).${ret}`
        )

        if (cursor.hasNext) {
            return cursor.next()
        } else {
            throw this.internal(`getOneFaster`, `${id} lacks ${ret} field`)
        }
    }

    public async getOneMultipleFaster<A, B>(
        id: string,
        a: string,
        b: string
    ): Promise<{ a: A; b: B }> {
        let cursor = await ArangoWrapper.db.query(
            aql`LET d=DOCUMENT(${id}) RETURN {a:d.${a},b:d.${b}}`
        )

        if (cursor.hasNext) {
            return cursor.next()
        } else {
            throw this.internal(
                `getOneMultipleFaster`,
                `${id} lacks ${a} or ${b} field`
            )
        }
    }

    public async getWithIdFaster<T>(
        ids: string[],
        ret: string
    ): Promise<
        ArrayCursor<{
            id: string
            v: T
        }>
    > {
        return ArangoWrapper.db.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)RETURN {id:d._id,v:d.${ret}}`
        )
    }

    public async getMultipleFaster<A, B>(
        ids: string[],
        a: string,
        b: string
    ): Promise<ArrayCursor<{ id: string; a: A; b: B }>> {
        return ArangoWrapper.db.query(
            aql`FOR i IN ${ids} let d=DOCUMENT(i)RETURN{id:d._id,a:d.${a},b:d.${b}}`
        )
    }

    /**
     * @param key looks like `status`
     * @param equals looks like 'COMPLETED'
     * @return An array of IDs that are invalid
     */
    public async assertEqualsFaster(
        ids: string[],
        key: string,
        equals: string
    ): Promise<ArrayCursor<string>> {
        return ArangoWrapper.db.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)FILTER d.${key}!=${equals} RETURN i`
        )
    }

    public async assertManyEqualsFaster(
        ids: string[],
        key: string,
        equals: string[]
    ): Promise<ArrayCursor<string>> {
        let q = aql`FOR i IN ${ids} LET d=DOCUMENT(i)FILTER`
        let notFirst = false
        for (const equal of equals) {
            if (notFirst) {
                q = aql`${q} && d.${key}!=${equal}`
            } else {
                notFirst = true
                q = aql`${q} d.${key}!=${equal}`
            }
        }
        q = aql`${q} RETURN i`
        return ArangoWrapper.db.query(q)
    }

    public async filterIdsFaster(
        ids: string[],
        key: string,
        equals: string
    ): Promise<ArrayCursor<string>> {
        return ArangoWrapper.db.query(
            aql`FOR i in ${ids} LET d=DOCUMENT(i)FILTER d.${key}==${equals} RETURN i`
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
    // Checks if the passed array intersects with the array target
    intersect?: string[]
    // Runs the passed AQL subquery
    custom?: GeneratedAqlQuery
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
