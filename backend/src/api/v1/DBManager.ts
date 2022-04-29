import Router from '@koa/router'
import {
    ArangoCollectionWrapper,
    IFilterOpts,
    IQueryRange,
    IQueryOpts,
} from '../../database'
import { APIError, HTTPStatus } from '../../lms/errors'
import { IFieldData, IForeignFieldData } from '../../lms/FieldData'
import { IArangoIndexes } from '../../lms/types'
import { convertToKey, splitId, str, tryParseJSON } from '../../lms/util'
import { AuthUser } from '../auth'
import { DataManager } from './DataManager'

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): DBManager<IArangoIndexes> {
    return Managers[splitId(id).col]
}
/** Map of all DB Managers */
export const Managers: { [dbname: string]: DBManager<IArangoIndexes> } = {}

/**
 * Database Manager. Handles conversion from raw database data to user-friendly
 * data. DBManager instances are associated with a single collection and its
 * Type.
 *
 * @typeParam Type The type of data managed by this instance
 */
export class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {
    /** Raw collection wrapper */
    public db: ArangoCollectionWrapper<Type>
    /** Default filter for `q` query string */
    private defaultFilter: string

    /**
     * Dependency resolver. Resolves `data.managerName` into a reference to the
     * manager.
     */
    public resolveDependencies() {
        for (let [key, data] of this.fieldEntries) {
            let foreign = data.type === 'fkey' || data.instance === 'fkey'

            if (data.managerName) {
                if (foreign) {
                    let m = Managers[data.managerName]
                    if (m) {
                        data.foreignManager = m
                        continue
                    }
                } else if (data.type === 'parent') {
                    let m = Managers[data.managerName]
                    if (m) {
                        data.parentManager = m
                        continue
                    }
                } else {
                    continue
                }
                throw this.internal(
                    'resolveDependencies',
                    `Data ${str(data)} has invalid data.manager field [${
                        data.managerName
                    }] for ${this.className}`
                )
            }

            if (foreign) {
                throw this.internal(
                    'resolveDependencies',
                    `Data ${str(
                        data
                    )} has foreign or data type but lacks data.manager field for ${
                        this.className
                    }`
                )
            }
        }
    }

    /**
     * Builds a DB Manager.
     *
     * @param dbName The collection name
     * @param className This class name for error handling
     * @param fields The fields of Type and their metadata
     * @param opts Optional options
     */
    constructor(
        dbName: string,
        className: string,
        fields: { [key: string]: IFieldData },
        opts?: {
            hasCreate?: boolean
            hasUpdate?: boolean
            defaultFilter?: string
        }
    ) {
        // Set a .id field
        fields['id'] = {
            type: 'string',
            optional: true,
        }

        super(className, fields, opts)

        // Assigns default filter value
        this.defaultFilter = 'id'
        let filter = opts?.defaultFilter
        if (filter) {
            if (filter in this.fieldData) {
                this.defaultFilter = filter
            } else {
                console.warn(
                    `default filter ${filter} dne on this type ${this.className}, intentional?`
                )
            }
        }

        // Creates arango wrapper
        this.db = new ArangoCollectionWrapper<Type>(dbName, this.fieldEntries)

        // Add this to the lookup table
        Managers[dbName] = this
    }

    /**
     * Converts a URL query into a more useful format. Also validates filtering
     * and sorting fields.
     *
     * @param q The query string to parse
     * @return The query options
     */
    public parseQuery(q: any): IQueryOpts {
        // Initial settings
        let opts: IQueryOpts = {
            range: {
                offset: 0,
                count: 10,
            },
            filters: [],
        }

        // Filtering
        // `{"key":"value", "key2":["1","2"]}`
        if (q.filter) {
            let filter = tryParseJSON(q.filter)
            if (filter) {
                // Build filters from each filter
                for (let [key, value] of Object.entries(filter)) {
                    let f: IFilterOpts = { key }

                    // Make sure f.key is valid
                    if (f.key === 'q') {
                        f.key = this.defaultFilter
                    } else if (
                        !(f.key in this.fieldData) ||
                        this.fieldData[f.key].hideGetAll
                    ) {
                        console.warn(`Invalid filtering id ${f.key}`)
                        console.warn(f)
                        continue
                    }

                    /** Field data for the filter */
                    const data = this.fieldData[f.key]

                    // Arrays
                    if (data.type === 'array') {
                        // Contains
                        if (typeof value === 'string') {
                            if (data.foreignManager) {
                                f.contains =
                                    data.foreignManager.db.keyToId(value)
                            } else {
                                f.contains = value
                            }
                            // Intersect
                        } else if (Array.isArray(value)) {
                            if (data.foreignManager) {
                                let kToi = data.foreignManager.db.keyToId
                                f.intersect = value.map((k) => kToi(k))
                            } else {
                                f.intersect = value
                            }
                        } else {
                            console.warn(`Invalid filtering value [${value}]`)
                            continue
                        }
                        // If the passed data is an array, use anyOf
                    } else if (Array.isArray(value)) {
                        if (data.type === 'parent' && data.parentManager) {
                            let dbWrapper = data.parentManager.db
                            f.anyOf = value.map((k) => dbWrapper.keyToId(k))
                        } else if (data.foreignManager) {
                            let dbWrapper = data.foreignManager.db
                            f.anyOf = value.map((k) => dbWrapper.keyToId(k))
                        } else {
                            f.anyOf = value
                        }
                        // Otherwise, use substring checking
                    } else {
                        let type = typeof value
                        if (
                            type === 'string' ||
                            type === 'boolean' ||
                            type === 'number'
                        ) {
                            f.substring = String(value)
                        } else {
                            console.warn(`Invalid filtering value [${value}]`)
                            continue
                        }
                    }

                    // Queries on `id` should be queries on `_key`
                    if (f.key === 'id') {
                        f.key = '_key'
                    }

                    opts.filters.push(f)
                }
            } else {
                console.warn(`Invalid filter [${q.filter}] passed`)
            }
        }

        // Sorting
        // `["id", "ASC"]`
        if (q.sort) {
            let sort = tryParseJSON(q.sort)
            if (sort && sort.length >= 2) {
                let key: string = sort[0]

                // Remove trailing '.id'
                if (key.endsWith('.id')) {
                    key = key.slice(0, -3)
                }

                // Only allow sorting on visible fields
                if (!this.fieldData?.[key].hideGetAll) {
                    let desc = sort[1] === 'DESC'
                    opts.sort = { key, desc }
                } else {
                    console.warn(`Invalid sorting id ${key}`)
                }
            }
        }

        // Range
        // `[0, 5]` or `["0", "5"]`
        if (q.range) {
            let range = tryParseJSON(q.range)
            if (range && range.length >= 2) {
                opts.range = {
                    offset: Math.max(parseInt(range[0]), 0),
                    count: Math.min(parseInt(range[1]), 50),
                }
            }
        }

        return opts
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param user The user that ran the query
     * @param opts The query options
     * @return The query's return values and metadata
     */
    public async runQuery(
        user: AuthUser,
        opts: IQueryOpts
    ): Promise<IQueryRange> {
        // Run the query
        let query = await this.db.runGetAllQuery(opts)
        let all = await query.cursor.all()

        // Convert all document foreign ids to keys and perform additional
        // dereferencing, if required
        await Promise.all(
            all.map(async (doc) => this.convertIDtoKEY(user, doc))
        )

        return {
            all,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + Math.min(query.size, opts.range.count),
        }
    }

    /**
     * Runs a query with additional filters not in the query string.
     *
     * @param user The user that performed the query
     * @param q The query object
     * @param filters Additional filters to use
     * @return The query's return values and metadata
     */
    public async runQueryWithFilter(
        user: AuthUser,
        q: any,
        ...filters: IFilterOpts[]
    ) {
        let opts = this.parseQuery(q)
        if (filters.length !== 0) {
            opts.filters = opts.filters.concat(filters)
        }
        return this.runQuery(user, opts)
    }

    /**
     * Retrieves the number of documents returned by the passed query, with
     * additional filters.
     *
     * @param q The query object
     * @param filters Additional filters to use
     * @return The number of documents in the query
     */
    public async queryLengthWithFilter(q: any, ...filters: IFilterOpts[]) {
        let opts = this.parseQuery(q)
        if (filters.length !== 0) {
            opts.filters = opts.filters.concat(filters)
        }
        return this.db.getAllCount(opts)
    }

    /**
     * Gets the document with the passed key from the database. Performs
     * dereferencing on its fields.
     *
     * @param user The user that requested the document
     * @param id A (valid) db id for the document
     * @param noDeref True if this should not dereference foreign keys
     * @param userRoute True if this is a user-facing route
     * @return A Type representing a document with key, with .id set and ._*
     * removed
     */
    public async getFromDB(
        user: AuthUser,
        id: string,
        noDeref: boolean,
        userRoute: boolean
    ): Promise<Type> {
        let doc = await this.db.get(id)

        // Map all of the document fields
        return this.mapEachField(
            doc,
            // all
            async (p, data) => {
                // Purge hidden fields
                if (data.hideGetId) {
                    delete p.obj[p.key]
                    return true
                    // Check for null-like
                } else if (
                    !(p.key in p.obj) ||
                    p.obj[p.key] === undefined ||
                    p.obj[p.key] === null
                ) {
                    // User default
                    if (data.userDefault && userRoute) {
                        console.warn(
                            `Using default ${data.default} for ${String(p.key)}`
                        )
                        p.obj[p.key] = data.userDefault
                        return true
                        // Standard default
                    } else if (data.default !== undefined) {
                        // Put default value in
                        p.obj[p.key] = data.default
                    } else {
                        console.warn(`${String(p.key)} missing in ${doc}`)
                    }
                    return true
                }
                return false
            },
            // foreign
            async (v, data) => {
                // Foreign keys are always foreign `ID`s
                if (typeof v === 'string') {
                    // If the deref should be overwritten
                    let overrideDeref = userRoute && data.overrideUserDeref
                    if (!overrideDeref && (data.getIdKeepAsRef || noDeref)) {
                        // Convert the key to an ID
                        return convertToKey(v)
                    } else if (data.foreignManager.db.isDBId(v)) {
                        // Dereference the id into an object
                        return await data.foreignManager.getFromDB(
                            user,
                            v,
                            noDeref,
                            userRoute
                        )
                    }
                }
                throw this.internal(
                    'getFromDB.mapForeignKeys',
                    `[${v}] expected to be a valid DB id for ${str(data)}`
                )
            },
            // data
            async (v, data) => {
                if (!noDeref || (data.overrideUserDeref && userRoute)) {
                    // Dereference documents in the database
                    await data.dataManager.mapForeignKeys(
                        v,
                        (v, d) => {
                            return d.foreignManager.getFromDB(
                                user,
                                v,
                                noDeref,
                                userRoute
                            )
                        },
                        (d) => d.type === 'parent'
                    )
                }
                // Convert ids to keys
                await data.dataManager.convertIDtoKEY(user, v)
                return v
            },
            // other
            async (v, data) => {
                // Verify types
                if (typeof v !== data.type) {
                    console.warn(`${v} is of incorrect type ${str(data)}`)
                }
                return v
            },
            // parent
            async (v, data) => convertToKey(v)
        )
    }

    /**
     * Create a new document and return its `ID`. Performs input validation and
     * accepts a mix of existing documents (as `KEY` or `ID`) or new documents
     * (if allowed by the field data).
     *
     * @param user The user that created the document
     * @param files Any files with the request
     * @param d The document to create
     * @return The new document's `ID`
     */
    public async create(user: AuthUser, files: any, d: Type) {
        // Generate a new ID for this document
        let id = this.db.generateDBID()
        d.id = id

        // Turns a fully-dereferenced document into a reference document
        let map = new Map<DataManager<any>, any[]>()
        await this.verifyAddedDocument(user, files, d, false, map, id)

        // Saves each document in the map to its respective collection
        try {
            for (let [api, docs] of map) {
                if (!(api instanceof DBManager)) {
                    continue
                }
                for (let doc of docs) {
                    console.log(
                        `Saving ${api.className} | ${JSON.stringify(doc)}`
                    )
                    await api.db.save(doc)
                }
            }
        } catch (err: any) {
            // Delete malformed documents
            console.error(`\nError with saving: ${err}\n`)
            for (let [api, docs] of map) {
                if (!(api instanceof DBManager)) {
                    continue
                }
                for (let doc of docs) {
                    if (doc._key) {
                        doc.id = doc._key
                        delete doc._key
                    }

                    let id = api.db.asId(doc.id)

                    if (await api.db.exists(id)) {
                        console.log(`Removing malformed doc w/ id ${id}`)
                        await api.db.remove(id)
                    }
                }
            }

            // If this is an APIError, pass control
            if (err instanceof APIError) {
                throw err
            }
            // Some other error type
            throw this.internal('create', JSON.stringify(err))
        }

        return id
    }

    /**
     * Updates an existing document with new fields as specified.
     *
     * @param user The user that updated the document
     * @param files Any files associated with the request
     * @param id The `ID` of the document to update
     * @param doc The update document
     */
    public async update(user: AuthUser, files: any, id: string, doc: Type) {
        // Set id
        doc.id = id

        let map = new Map<DataManager<any>, any[]>()
        await this.verifyAddedDocument(user, files, doc, true, map, id)

        // Updates each document in the map to its respective collection
        for (let [api, docs] of map) {
            if (!(api instanceof DBManager)) {
                continue
            }
            for (let d of docs) {
                if (!d.id || !api.db.isDBId(d.id)) {
                    throw this.internal(
                        'create',
                        `ID ${d.id} invalid in document ${JSON.stringify(d)}`
                    )
                }
                if (await api.db.exists(d.id)) {
                    console.log(
                        `Updating ${api.className} | ${JSON.stringify(d)}`
                    )
                    await api.db.update(d)
                } else {
                    console.log(
                        `Saving ${api.className} | ${JSON.stringify(d)}`
                    )
                    await api.db.save(d)
                }
            }
        }
    }

    /**
     * Deletes a document and all its associated documents. This does not
     * update parent documents.
     *
     * @param user The user that deletes this document
     * @param id An `ID` to delete
     */
    public async delete(user: AuthUser, id: string) {
        let doc = await this.db.get(id)

        // Delete children
        doc = await this.mapForeignKeys(
            doc,
            async (v, data) => {
                if (typeof v !== 'string') {
                    throw this.internal(
                        'delete.mapForeignKeys',
                        `[${v}] is not a string`
                    )
                }
                return data.foreignManager.delete(user, v)
            },
            // Only freeable fields can be deleted
            (data) => !data.freeable
        )

        console.log(`DELETING ${this.className} | ${id} | ${doc}`)
        await this.db.remove(id)
    }

    /**
     * Removes all orphaned documents from this collection. A document is an
     * orphan if:
     * - It has a parent field that points to a document that does not exist.
     * - It should have a parent field, but doesn't
     * - It has an invalid parent field
     */
    private async deleteOrphans() {
        if (!this.parentField) {
            throw this.internal(
                'deleteOrphans',
                `deleteOrphans called on ${this.className}`
            )
        }
        return this.db.deleteOrphans(this.parentField.local)
    }

    /**
     * Removes all foreign key references for documents in this collection that
     * no longer point to valid documents. NOTE: VERY EXPENSIVE, only run when
     * necessary
     */
    private async disown() {
        if (this.foreignEntries.length === 0) {
            throw this.internal('disown', `disown called on ${this.className}`)
        }

        let cursor = await this.db.getAll()

        while (cursor.hasNext) {
            let doc = await cursor.next()
            // db.getAll returns _key's
            doc.id = doc._key

            // Delete disowned children
            doc = await this.forEachField<IForeignFieldData>(
                doc,
                this.foreignEntries,
                async (p, k, d) => {
                    let c = d.foreignManager
                    if (!(await c.db.tryExists(k))) {
                        p.obj[p.key] = <any>''
                    }
                },
                async (p, a, d) => {
                    let c = d.foreignManager
                    for (var i = a.length - 1; i >= 0; i--) {
                        if (!(await c.db.tryExists(a[i]))) {
                            a.splice(i, 1)
                        }
                    }
                },
                async (p, o, d) => {
                    let c = d.foreignManager
                    for (let k in o) {
                        let sAr = o[k]

                        if (!Array.isArray(sAr)) {
                            throw this.internal(
                                'disown',
                                `${sAr} is not an array`
                            )
                        }
                        for (var i = sAr.length - 1; i >= 0; i--) {
                            if (!(await c.db.tryExists(sAr[i]))) {
                                sAr.splice(i, 1)
                            }
                        }
                        // Delete empty steps
                        if (sAr.length === 0) delete o[k]
                    }
                }
            )

            await this.db.update(doc)
        }
    }

    /**
     * Attach debugging routes. Defaults to /orphan and /disown.
     *
     * @param r A Router to utilize
     */
    public debugRoutes(r: Router) {
        // Orphan delete
        if (this.parentField) {
            r.delete('/orphan', async (ctx) => {
                await this.deleteOrphans()
                ctx.status = HTTPStatus.OK
            })
        }

        // Disown update
        if (this.foreignEntries.length !== 0) {
            r.delete('/disown', async (ctx) => {
                await this.disown()
                ctx.status = HTTPStatus.OK
            })
        }
    }
}
