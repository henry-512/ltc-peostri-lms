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
import { IFieldData } from './lms/FieldData'
import { IArangoIndexes } from './lms/types'
import {
    appendReturnFields,
    generateDBID,
    isDBKey,
    keyToId,
    splitId,
} from './lms/util'

/**
 * A wrapper for ArangoJS function calls to avoid directly using AQL syntax.
 * This was done to more easily facilitate switching underlying database
 * architecture.
 *
 * The database configuration is established by config.ts.
 *
 * Each ArangoWrapper instance manages a single collection in the database. Some
 * functions run independent of the collection, but should always be associated
 * with the data they are using.
 *
 * Extends IErrorable to provide cleaner error handling.
 *
 * Note: `ID`s are in the form `[collection]/[KEY]`, while `KEY`s lack the
 * `[collection]` prefix. `ID`s are required for internal document relations but
 * `KEY`s are more useful for the frontend (the collection prefix makes
 * filtering and `/:id` routes more difficult).
 *
 * @typeParam Type An interface for the data managed by this collection.
 */
export class ArangoCollectionWrapper<
    Type extends IArangoIndexes
> extends IErrorable {
    // Set up database
    protected static DatabaseInstance = new Database({
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
     * @param doc A document for this collection
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
     *
     * @param dbName The collection name
     * @param fields An array of field data to use to build the return query
     */
    constructor(private dbName: string, fields: [string, IFieldData][]) {
        // Build error handler
        super(dbName)

        // Set collection
        this.collection = ArangoCollectionWrapper.DatabaseInstance.collection(
            this.dbName
        )
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
    protected getAllBuildFilterKey(filter: IFilterOpts) {
        return filter.ref
            ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
            : aql`z.${filter.key}`
    }

    /**
     * Appends the return segment to the query.
     * @param query An AQL query to append to
     * @returns The finalized query
     */
    protected getAllReturnQuery(query: GeneratedAqlQuery) {
        return aql`${query} RETURN {${this.getAllQueryFields}}`
    }

    /**
     * Generates a query that performs filtering, sorting, and offsets on the
     * entire collection. This accepts several options which are typically
     * prepared from the request query.
     *
     * The return fields are specified by the fields passed in the constructor.
     *
     * @param sort Sorting key and direction
     * @param offset The number of documents to use as an offset
     * @param count The maximum number of documents to return
     * @param filters All of the filters to apply to the query
     * @param justIds True if this query should return only database `ID`s
     * @param raw True if this query should return the raw documents
     *
     * @return An AQL query for the passed options
     */
    protected buildGetAllQuery(
        sort: ISortOpts,
        offset: number,
        count: number,
        filters: IFilterOpts[],
        justIds: boolean,
        raw: boolean
    ): GeneratedAqlQuery {
        // Starting query
        let query = aql`FOR z IN ${this.collection}`

        // Loop over the fulters
        for (const filter of filters) {
            // Support for custom keys
            let k = filter.custom ?? this.getAllBuildFilterKey(filter)
            // Filter checkings
            if (filter.inArray) {
                query = aql`${query} FILTER ${filter.inArray} IN ${k}`
            }
            // Direct equals
            if (filter.eq !== undefined) {
                query = aql`${query} FILTER ${k} == ${filter.eq}`
            }
            // Checks if the key is in an array
            if (filter.in !== undefined) {
                query = aql`${query} FILTER ${k} IN ${filter.in}`
            }
            // Substring or regex check
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
            // Checks if any of the elements from the key's array are in the filter's array
            if (filter.intersect) {
                query = aql`${query} FILTER LENGTH(INTERSECTION(${k}, ${filter.intersect}))!=0`
            }
        }

        // Applies sorting
        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        // Sorting direction and limiter
        query = aql`${query} ${
            sort.desc ? 'DESC' : 'ASC'
        } LIMIT ${offset}, ${count}`

        // Return fields
        if (justIds) {
            query = aql`${query} RETURN z._id`
        } else if (raw) {
            query = aql`${query} RETURN z`
        } else {
            query = this.getAllReturnQuery(query)
        }

        return query
    }

    /**
     * Runs a get-all query with the passed options, returning the queried
     * elements and the query's size.
     *
     * @param opts All of the query options
     * @return cursor The cursor containing the elements in the array
     * @return size The full return of the query, ignoring the range
     */
    public async runGetAllQuery(opts: IQueryOpts): Promise<{
        cursor: ArrayCursor<any>
        size: number
    }> {
        let query = this.buildGetAllQuery(
            opts.sort ?? { desc: false, key: '_key' },
            opts.range.offset,
            opts.range.count,
            opts.filters,
            opts.justIds ?? false,
            opts.raw ?? false
        )

        let cursor = await ArangoCollectionWrapper.DatabaseInstance.query(
            query,
            {
                fullCount: true,
            }
        )

        let size =
            cursor.extra.stats?.fullCount ??
            (await this.collection.count()).count

        return { cursor, size }
    }

    /**
     * Gets the number of elements returned by the query.
     *
     * @param opts All of the query options
     * @return The number of elements in the query
     */
    public async getAllCount(opts: IQueryOpts): Promise<number> {
        let query = this.buildGetAllQuery(
            opts.sort ?? { desc: false, key: '_key' },
            opts.range.offset,
            opts.range.count,
            opts.filters,
            opts.justIds ?? false,
            opts.raw ?? false
        )

        let cursor = await ArangoCollectionWrapper.DatabaseInstance.query(
            query,
            {
                count: true,
            }
        )

        if (cursor.count === undefined) {
            throw this.internal('queryGetCount', '.count field missing')
        }

        return cursor.count ?? 0
    }

    /**
     * Checks if the passed `ID` is in this collection.
     *
     * @param id A database `ID` to check
     * @return True if the document exists, false if the string is not an `ID`
     * or if the document does not exist
     */
    public async tryExists(id: string) {
        return this.isDBId(id) && this.existsUnsafe(id)
    }

    /**
     * Checks if the passed `KEY` is in this collection.
     *
     * @param key A `KEY` to check
     * @return True if the document exists, false if the string is not a `KEY`
     * or if the document does not exist
     */
    public async tryKeyExists(key: string) {
        return isDBKey(key) && this.existsUnsafe(key)
    }

    /**
     * Checks if the passed `ID` is in this collection but throws errors.
     *
     * @param id A database `ID` to check
     * @return True if the document exists, false otherwise
     * @throws NOT_FOUND if `id` is not an `ID`
     */
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

    /**
     * Checks if the passed `KEY` is in this collection but throws errors.
     *
     * @param key A `KEY` to check
     * @return True if the document exists, false otherwise
     * @throws NOT_FOUND if `key` is not an `KEY`
     */
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

    /**
     * Asserts that the passed `key` exists in this collection. Also converts it
     * into an `ID`.
     *
     * @param key A `KEY` to check
     * @return `key` as an `ID`
     * @throws NOT_FOUND if `key` is not a `KEY` or if it does not exist
     */
    public async assertKeyExists(key: string) {
        if (!isDBKey(key)) {
            throw this.error(
                'keyExists',
                HTTPStatus.NOT_FOUND,
                'Document not found',
                `[${key}] is not a valid key for this collection`
            )
        }
        // Convert to key
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

    /**
     * Asserts that the passed `ID` exists in this collection.
     *
     * @param id An `ID` to check
     * @throws NOT_FOUND if `id` is not an `ID` or if it does not exist
     */
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

    /**
     * Returns the raw document specified by the `id` field.
     *
     * @param id An `ID` to retrieve
     * @return A raw document (without internal _ fields and with a `KEY` .id
     * field)
     * @throws NOT_FOUND if `id` is not an `ID` or if it does not exist
     */
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

        // Strip internal values
        doc.id = doc._key
        delete doc._key
        delete doc._id
        delete doc._rev

        return doc
    }

    /**
     * Saves the passed document in the database. Requires a `.id` field as an
     * `ID` or `KEY`. The parameter `doc` should be considered unusable after
     * calling this function.
     *
     * @param doc A document to save in the database
     * @returns The new document's document handle
     * @throws INTERNAL If the `doc` is missing an `ID` field
     * @throws NOT_FOUND If the `doc.id` field is invalid
     */
    public async save(doc: Type) {
        if (doc.id) {
            doc._key = this.asKey(doc.id)
            // `doc.id` is redundant in the DB
            delete doc.id

            return this.saveUnsafe(doc)
        }

        throw this.internal('save', `${JSON.stringify(doc)} lacks id key`)
    }

    /**
     * Updates the document in the database with the passed fields. Not that
     * this does not replace an existing document. Deletion of fields requires
     * setting that field to `null`.  The parameter `doc` should be considered
     * unusable after calling this function.
     *
     * @param doc A document to use as an update. This should have a `.id` or
     * `._key` field with the document reference to update.
     * @throws INTERNAL If the `doc` is missing a `.id` or `._key` field
     * @throws NOT_FOUND If the `doc.id` field is invalid
     */
    public async update(doc: Type) {
        if (doc.id) {
            doc._key = this.asKey(doc.id)
            // `doc.id` is redundant in the DB
            delete doc.id
        }
        if (doc._key) {
            return this.updateUnsafe(doc, {
                // `null` fields delete the value
                keepNull: false,
                // Object fields should be replaced instead of merged
                mergeObjects: false,
            })
        }
        throw this.internal(
            'save',
            `${JSON.stringify(doc)} lacks id or _key key`
        )
    }

    /**
     * Deletes the passed `ID` from the database
     *
     * @param id An `ID` for this collection
     */
    public async remove(id: string) {
        if (this.isDBId(id)) {
            return this.removeUnsafe(id)
        }
        throw this.internal('delete', `${id} is not a valid Id`)
    }

    /**
     * Filters documents with parent fields that cannot be properly dereferenced
     * ie. `DOCUMENT(d.parent) === null` and deletes them.
     *
     * @param parentFieldLocal The parent key in this document to check
     */
    public async deleteOrphans(parentFieldLocal: string) {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR d IN ${this.collection} FILTER DOCUMENT(d.${parentFieldLocal}) == null REMOVE d IN ${this.collection}`
        )
    }

    /**
     * Returns all documents in the collection.
     *
     * @param opts Optional AQL query options to use for the query
     * @return A cursor with all of the documents in the query
     */
    public async getAll(opts?: QueryOptions) {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR d in ${this.collection} RETURN d`,
            opts
        )
    }

    /**
     * Updates all of the `ids` with `document(id)[key] = value`
     * @param ids An array of `ID`s to update
     * @param key A key in the document to update
     * @param value The value to set the key to.
     */
    public async updateManyFaster(ids: string[], key: string, value: any) {
        let keys: string[] = ids.map((id) => this.asKey(id))
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR k IN ${keys} UPDATE {_key:k} WITH{${key}:${value}} IN ${this.collection}`
        )
    }

    /**
     * Updates all documents in this collection that pass a simple == filter
     * with the passed value and returns the `ID`s that were updated.
     *
     * @param fKey The filtering key
     * @param fEq The filtering value to compare against
     * @param key The document key to update
     * @param value The value to set the key to
     * @return An ArrayCursor of all updated ids. Documents that already have
     * the value set are not returned.
     */
    public async updateFilterFaster(
        fKey: string,
        fEq: any,
        key: string,
        value: any
    ): Promise<ArrayCursor<string>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR d IN ${this.collection} FILTER d.${fKey}==${fEq} FILTER d.${key}!=${value} UPDATE d WITH {${key}:${value}} IN ${this.collection} RETURN d._id`
        )
    }

    /**
     * Sets `DOCUMENT(id).key = value`
     *
     * @param id An `ID` to update
     * @param key The key of the document to update
     * @param value The value to set the key to
     */
    public async updateFaster(id: string, key: string, value: any) {
        let k = this.asKey(id)
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`UPDATE{_key:${k}}WITH{${key}:${value}}IN${this.collection}`
        )
    }

    /**
     * Returns all of the raw documents that are in the array of `ID`s. ***DOES
     * NOT SET `.id` OR CLEAR `_` FIELDS***
     *
     * @param ids An array of `ID`s to return
     * @return A cursor with all of the raw documents
     */
    public async getFromIds(ids: string[]): Promise<ArrayCursor<Type>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i IN ${ids} RETURN DOCUMENT(i)`
        )
    }

    /**
     * Gets a single key off each document referenced by `ids`. The ordering of
     * the return values cannot be guaranteed to map directly to the passed
     * `ids`.
     *
     * @typeParam T The type of `doc.ret`. This affects the return type of the
     * cursor.
     * @param ids An array of `ID`s to return values from
     * @param ret A key of Type to return
     * @return A cursor that returns the values
     */
    public async getManyField<T>(
        ids: string[],
        ret: string
    ): Promise<ArrayCursor<T>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)RETURN d.${ret}`
        )
    }

    /**
     * Gets a single key off a single document. Returns the value directly.
     *
     * @typeParam T The type of `doc.ret`
     * @param id An `ID` to retrieve data for
     * @param ret The key of Type to return
     * @return `DOCUMENT(id).ret`
     * @throws INTERNAL If the cursor returns no values
     */
    public async getOneField<T>(id: string, ret: string): Promise<T> {
        let cursor = await ArangoCollectionWrapper.DatabaseInstance.query(
            aql`RETURN DOCUMENT(${id}).${ret}`
        )

        if (cursor.hasNext) {
            return cursor.next()
        } else {
            throw this.internal(`getOneFaster`, `${id} lacks ${ret} field`)
        }
    }

    /**
     * Returns multiple fields from a single document.
     *
     * @typeParam A The type of `a`'s value
     * @typeParam B The type of `b`'s value
     * @param id An `ID` to check
     * @param a A key of Type to return
     * @param b A key of Type to return
     * @return An object with an `a` and `b` field coresponding to the two keys
     * passed as `a` and `b`
     * @throws INTERNAL If the cursor returns no values
     */
    public async getOneFields<A, B>(
        id: string,
        a: string,
        b: string
    ): Promise<{ a: A; b: B }> {
        let cursor = await ArangoCollectionWrapper.DatabaseInstance.query(
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

    /**
     * Gets a single key and its document's `ID` from each document referenced
     * by `ids`. This should be used if mapping a value with its document's `ID`
     * is important.
     *
     * @typeParam T The type of `doc.ret`. This affects the return type of the
     * cursor.
     * @param ids An array of `ID`s to return values from
     * @param ret A key of Type to return
     * @return A cursor that returns an id+value object representing the
     * document `ID` and value of `doc.ret`
     */
    public async getManyFieldWithId<T>(
        ids: string[],
        ret: string
    ): Promise<ArrayCursor<{ id: string; v: T }>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)RETURN {id:d._id,v:d.${ret}}`
        )
    }

    /**
     * Gets multiple key values and their respective document's `ID` field from
     * the passed array of `ID`s.
     *
     * @typeParam A the type of `doc.a`
     * @typeParam B the type of `doc.b`
     * @param ids An array of `ID`s to return values for
     * @param a The first key to return
     * @param b The second key to return
     * @return A cursor of objects containing the `a` and `b` values alongside
     * their `ID`
     */
    public async getManyFields<A, B>(
        ids: string[],
        a: string,
        b: string
    ): Promise<ArrayCursor<{ id: string; a: A; b: B }>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i IN ${ids} let d=DOCUMENT(i)RETURN{id:d._id,a:d.${a},b:d.${b}}`
        )
    }

    /**
     * Returns an array of `ID`s that **DO NOT** match the passed filter. To
     * assert that all of the passed `ID`s match, `cursor.hasNext` should be
     * `false`.
     *
     * @param ids An array of `ID`s to filter with
     * @param key Key to filter on
     * @param equals The filter value to compare against with `==`
     * @return A cursor of `ID`s that do not match the filter
     */
    public async getNotEqual(
        ids: string[],
        key: string,
        equals: string
    ): Promise<ArrayCursor<string>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i in ${ids} let d=DOCUMENT(i)FILTER d.${key}!=${equals} RETURN i`
        )
    }

    /**
     * Returns an array of `ID`s that **DO NOT** match **ANY** of the passed
     * values of the filter. To assert that all of the passed `ID`s match,
     * `cursor.hasNext` should be `false`.
     *
     * @param ids An array of `ID`s to filter with
     * @param key Key to filter on
     * @param equals An array of values to filter against
     */
    public async getAllNotEqual(
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
        return ArangoCollectionWrapper.DatabaseInstance.query(q)
    }

    /**
     * Returns an array of `ID`s that **DO** match the passed filter.
     *
     * @param ids An array of `ID`s to filter with
     * @param key Key to filter on
     * @param equals The filter value to compare against with `==`
     * @return A cursor of `ID`s that match the filter
     */
    public async filterField(
        ids: string[],
        key: string,
        equals: string
    ): Promise<ArrayCursor<string>> {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i in ${ids} LET d=DOCUMENT(i)FILTER d.${key}==${equals} RETURN i`
        )
    }

    /**
     * Performs UNION_DISTINCT operation on all `doc.{key}` fields for the
     * passed array of `ID`s.
     *
     * @param ids The `ID`s to update
     * @param key The array key of Type to union against
     * @param array The array to union with
     */
    public async unionManyField(ids: string[], key: string, array: any[]) {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i IN ${ids} LET d=DOCUMENT(i) UPDATE d WITH {${key}:UNION(d.${key},${array})} IN ${this.collection}`
        )
    }

    /**
     * Removes the passed value from any arrays in the documents referenced by
     * `ids`.
     * 
     * @param ids The `ID`s to update
     * @param key The key of Type that is an array to remove elements from
     * @param value The value to remove from the arrays
     */
    public async removeFromFieldArray(ids: string[], key: string, value: any) {
        return ArangoCollectionWrapper.DatabaseInstance.query(
            aql`FOR i IN ${ids} LET d=DOCUMENT(i) UPDATE d WITH {${key}:REMOVE_VALUE(d.${key},${value})} IN ${this.collection}`
        )
    }

    /**
     * Runs the passed AQL query. This should be used sparingly.
     *
     * @param aql An AQL query to run
     */
    public async rawQuery(aql: GeneratedAqlQuery) {
        return ArangoCollectionWrapper.DatabaseInstance.query(aql)
    }
}

/**
 * An object containing a query's filtering options.
 */
export interface IFilterOpts {
    /** The key to use for filtering */
    key: string
    /**
     * If set, `filter.key` is a document reference that will be de-referenced
     * and use `filter.ref`'s value as a key of that document for filtering. ie.
     * {key:rank, ref:name, q:Admin} uses `DOCUMENT(doc.key).ref` for filtering
     */
    ref?: string
    /** Complete checking */
    in?: string[]
    /** Substring check */
    q?: string
    /** Complete checking against single element */
    eq?: string
    /** Checks if the passed string is in the array target */
    inArray?: string
    /** Checks if the passed array intersects with the array target */
    intersect?: string[]
    /** Runs the passed AQL subquery */
    custom?: GeneratedAqlQuery
}

/**
 * An object containing a query's sorting options
 */
export interface ISortOpts {
    /** True if the sorting should be descending, false if the sorting should be
     * ascending */
    desc: boolean
    /** The key to use for sorting */
    key: string
    /**
     * If set, `filter.key` is a document reference that will be de-referenced
     * and use `filter.ref`'s value as a key of that document for filtering. ie.
     * {key:rank, ref:name, q:Admin} uses `DOCUMENT(doc.key).ref` for filtering
     */
    ref?: string
}

/**
 * A full object containing all of the query options
 */
export interface IQueryOpts {
    /** An array of filters to apply */
    filters: IFilterOpts[]
    /** The sorting direction and key */
    sort?: ISortOpts
    /** The offset and count to use for the query */
    range: {
        offset: number
        count: number
    }
    /** True if this should return just the `._id` field */
    justIds?: boolean
    /** True if this should return the raw document */
    raw?: boolean
}

/**
 * A representation of the return values of a query. This is designed for
 * converting a query into an outgoing HTTP message and building it's
 * `content-range` header.
 */
export interface IQueryRange {
    /** All documents */
    all: any[]
    /** The number of documents in the entire collection (including filter) */
    size: number
    /** The index in the query matching the first element */
    low: number
    /** The index in the query matching the last element */
    high: number
}
