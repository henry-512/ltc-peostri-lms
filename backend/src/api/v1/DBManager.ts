import Router from '@koa/router'
import {
    ArangoCollectionWrapper,
    IFilterOpts,
    IGetAllQueryResults,
    IQueryGetOpts,
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
export const Managers: { [dbname: string]: DBManager<IArangoIndexes> } = {}

export class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {
    public db: ArangoCollectionWrapper<Type>
    private defaultFilter: string

    // Dependency resolver
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
        // set id field
        fields['id'] = {
            type: 'string',
            optional: true,
        }

        super(className, fields, opts)

        this.defaultFilter = '_key'
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

        this.db = new ArangoCollectionWrapper<Type>(dbName, this.fieldEntries)

        // Add this to the lookup table
        Managers[dbName] = this
    }

    public parseQuery(q: any): IQueryGetOpts {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            },
            filters: [],
        }

        // Filtering
        if (q.filter) {
            let filter = tryParseJSON(q.filter)
            if (filter) {
                for (let [key, value] of Object.entries(filter)) {
                    let f: IFilterOpts = { key }

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

                    let data = this.fieldData[f.key]

                    if (data.type === 'array') {
                        if (typeof value === 'string') {
                            if (data.foreignManager) {
                                f.inArray =
                                    data.foreignManager.db.keyToId(value)
                            } else {
                                f.inArray = value
                            }
                        } else {
                            console.warn(`Invalid filtering value [${value}]`)
                            continue
                        }
                    } else if (Array.isArray(value)) {
                        if (data.type === 'parent' && data.parentManager) {
                            let dbWrapper = data.parentManager.db
                            f.in = value.map((k) => dbWrapper.keyToId(k))
                        } else if (data.foreignManager) {
                            let dbWrapper = data.foreignManager.db
                            f.in = value.map((k) => dbWrapper.keyToId(k))
                        }
                        f.in = value
                    } else {
                        let type = typeof value
                        if (
                            type === 'string' ||
                            type === 'boolean' ||
                            type === 'number'
                        ) {
                            f.q = value as string
                        } else {
                            console.warn(`Invalid filtering value [${value}]`)
                            console.warn(f)
                            console.warn(value)
                            continue
                        }
                    }

                    // ids are _keys
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
        if (q.sort) {
            let sort = tryParseJSON(q.sort)
            if (sort && sort.length >= 2) {
                let key: string = sort[0]

                // Remove trailing '.id'
                if (key.endsWith('.id')) {
                    key = key.slice(0, -3)
                }

                if (key in this.fieldData && !this.fieldData[key].hideGetAll) {
                    let desc = sort[1] === 'DESC'
                    opts.sort = { key, desc }
                } else {
                    console.warn(`Invalid sorting id ${key}`)
                }
            }
        }

        // Range
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
     * @return A cursor representing all db objects that fit the query
     */
    public async runQuery(
        user: AuthUser,
        opts: IQueryGetOpts
    ): Promise<IGetAllQueryResults> {
        let query = await this.db.runGetAllQuery(opts)
        let all = await query.cursor.all()

        // Convert all document foreign ids to keys
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

    public async queryLengthWithFilter(q: any, ...filters: IFilterOpts[]) {
        let opts = this.parseQuery(q)
        if (filters.length !== 0) {
            opts.filters = opts.filters.concat(filters)
        }
        return this.db.getAllCount(opts)
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(
        user: AuthUser,
        id: string,
        noDeref: boolean,
        userRoute: boolean
    ): Promise<Type> {
        let doc = await this.db.get(id)

        return this.mapEachField(
            doc,
            // all
            async (p, data) => {
                if (data.hideGetId) {
                    delete p.obj[p.key]
                    return true
                } else if (
                    !(p.key in p.obj) ||
                    p.obj[p.key] === undefined ||
                    p.obj[p.key] === null
                ) {
                    if (data.userDefault && userRoute) {
                        console.warn(
                            `Using default ${data.default} for ${String(p.key)}`
                        )
                        p.obj[p.key] = data.userDefault
                        return true
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
                if (typeof v === 'string') {
                    let overrideDeref = userRoute && data.overrideUserDeref
                    if (!overrideDeref && (data.getIdKeepAsRef || noDeref)) {
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
            // Warp return values and convert foreign keys
            async (v, data) => {
                if (!noDeref || (data.overrideUserDeref && userRoute)) {
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
                await data.dataManager.convertIDtoKEY(user, v)
                return v
            },
            // other
            async (v, data) => {
                if (typeof v !== data.type) {
                    console.warn(`${v} is of incorrect type ${str(data)}`)
                }
                return v
            },
            // parent
            async (v, data) => convertToKey(v)
        )
    }

    public async create(user: AuthUser, files: any, d: Type, real: boolean) {
        // Generate a new ID for this document
        let id = this.db.generateDBID()
        d.id = id

        // The passed document has a parent key, so we need to
        // update the parent to include this document
        // if (this.parentKey && this.parentKey.local in doc) {
        //     // TODO
        // }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = new Map<DataManager<any>, any[]>()
        await this.verifyAddedDocument(user, files, d, false, map, id)

        real || console.log('FAKING CREATE')
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
                    real && (await api.db.save(doc))
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

    public async update(
        user: AuthUser,
        files: any,
        id: string,
        doc: Type,
        real: boolean
    ) {
        // doc.id is a KEY here and needs to be converted
        doc.id = id

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        let map = new Map<DataManager<any>, any[]>()
        await this.verifyAddedDocument(user, files, doc, true, map, id)

        real || console.log('FAKING UPDATE')
        // Updates each document in the map to its respective collection
        // TODO Delete/revert malformed docs
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
                    real && (await api.db.update(d))
                } else {
                    console.log(
                        `Saving ${api.className} | ${JSON.stringify(d)}`
                    )
                    real && (await api.db.save(d))
                }
            }
        }
    }

    /**
     * Deletes a document and all its associated documents. This does not
     * update parent documents.
     * @param base True if this is the base call (ie the call that should
     *  update parent fields)
     */
    public async delete(
        user: AuthUser,
        id: string,
        real: boolean,
        base: boolean
    ) {
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
                return data.foreignManager.delete(user, v, real, false)
            },
            (data) => !data.freeable
        )

        console.log(
            `${real ? 'DELETING' : 'FAKE DELETING'} ${
                this.className
            } | ${id} | ${doc}`
        )
        real && (await this.db.remove(id))
    }

    /**
     * Removes all orphaned documents from this collection.
     * A document is an orphan if:
     * - It has a parent field that points to a document that does not exist.
     * - It should have a parent field, but doesn't
     * - It has an invalid parent field
     * NOTE: VERY EXPENSIVE, don't run that often
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
     * Removes all abandoned documents from this collection.
     * A document is abandoned iff:
     * - It has a parent field that points to a valid document
     * - AND its parent document does not hold a reference to it
     * NOTE: VERY EXPENSIVE, don't run that often
     */
    private async deleteAbandoned() {
        // Not implemented :)
        return
    }

    /**
     * Removes all foreign key references for documents in this collection that no longer point to valid documents.
     * NOTE: EXCEPTIONALLY EXPENSIVE, only run when necessary
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

    public debugRoutes(r: Router) {
        // Orphan delete
        if (this.parentField) {
            r.delete('/orphan', async (ctx, next) => {
                if (ctx.header['user-agent'] === 'backend-testing') {
                    await this.deleteOrphans()
                    ctx.status = HTTPStatus.OK
                } else {
                    await next()
                }
            })
        }

        // Disown update
        if (this.foreignEntries.length !== 0) {
            r.delete('/disown', async (ctx, next) => {
                if (ctx.header['user-agent'] === 'backend-testing') {
                    await this.disown()
                    ctx.status = HTTPStatus.OK
                } else {
                    await next()
                }
            })
        }
    }
}
