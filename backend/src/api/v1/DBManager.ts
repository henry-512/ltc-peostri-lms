import Router from '@koa/router'
import {
    ArangoWrapper,
    IFilterOpts,
    IGetAllQueryResults,
    IQueryGetOpts,
} from '../../database'
import { APIError, HTTPStatus } from '../../lms/errors'
import { IFieldData, IForeignFieldData } from '../../lms/FieldData'
import { IArangoIndexes } from '../../lms/types'
import { convertToKey, isDBKey, splitId } from '../../lms/util'
import { AuthUser } from '../auth'
import { DataManager } from './DataManager'

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): DBManager<IArangoIndexes> {
    return instances[splitId(id).col]
}
const instances: { [dbname: string]: DBManager<IArangoIndexes> } = {}

export abstract class DBManager<
    Type extends IArangoIndexes
> extends DataManager<Type> {
    public db: ArangoWrapper<Type>
    private defaultFilter: IFilterOpts

    constructor(
        dbName: string,
        className: string,
        fields: { [key: string]: IFieldData },
        opts?: {
            /**
             * Create/Update timestamp
             */
            hasCUTimestamp?: boolean
            defaultFilter?: IFilterOpts
        }
    ) {
        fields['id'] = {
            type: 'string',
            optional: true,
        }

        super(className, fields, opts)

        this.defaultFilter = opts?.defaultFilter ?? { key: '_key' }
        this.db = new ArangoWrapper<Type>(dbName, this.fieldEntries)
    }

    public async exists(id: string) {
        return this.db.exists(id)
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param query An object with queryable fields.
     * @return A cursor representing all db objects that fit the query
     */
    public async getAll(query: any) {
        const results = await this.query(query)

        // Convert all document foreign ids to keys
        await Promise.all(
            results.all.map(async (doc) => this.convertIdsToKeys(doc))
        )

        return results
    }

    public async query(q: any): Promise<IGetAllQueryResults> {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            },
        }

        // Filtering
        if (q.filter) {
            let filter = JSON.parse(q.filter)
            opts.filters = []

            for (let [key, value] of Object.entries(filter)) {
                let f: IFilterOpts = { key }

                if (key === 'q') {
                    f.key = this.defaultFilter.key
                    if (this.defaultFilter.ref) {
                        f.ref = this.defaultFilter.ref
                    }
                } else if (
                    !(key in this.fieldData) ||
                    this.fieldData[key].hideGetAll
                ) {
                    console.warn(`Invalid filtering id ${key}`)
                    console.warn(f)
                    continue
                }

                if (Array.isArray(value)) {
                    f.in = value
                } else if (typeof value === 'string') {
                    f.q = value
                } else {
                    console.warn(`Invalid filtering value [${value}]`)
                    console.warn(f)
                    continue
                }

                opts.filters.push(f)
            }
        }

        // Sorting
        if (q.sort && q.sort.length === 2) {
            let key: string = q.sort[0]

            // Remove trailing '.id'
            if (key.endsWith('.id')) {
                key = key.slice(0, -3)
            }

            if (key in this.fieldData && !this.fieldData[key].hideGetAll) {
                let desc = q.sort[1] === 'DESC'

                opts.sort = { key, desc }
            } else {
                console.warn(`Invalid sorting id ${key}`)
            }
        }

        if (q.range && q.range.length == 2) {
            opts.range = {
                offset: parseInt(q.range[0]),
                count: Math.min(parseInt(q.range[1]), 50),
            }
        }

        let query = await this.db.queryGet(opts)
        let all = await query.cursor.all()

        // Convert all document foreign ids to keys
        await Promise.all(all.map(async (doc) => this.convertIdsToKeys(doc)))

        return {
            all: all,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + opts.range.count,
        }
    }

    public convertIdsToKeys(doc: Type) {
        return this.mapForeignKeys(doc, async (k, d) => {
            if (typeof k === 'string' && d.foreignApi.db.isDBId(k)) {
                return splitId(k).key
            } else if (typeof k === 'object') {
                return k
            }
            throw this.error(
                'convertIds',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid document status',
                `${this.className} [${k}] expected to be a DB id`
            )
        })
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(
        user: AuthUser,
        depth: number,
        id: string
    ): Promise<Type> {
        let doc = await this.db.get(id)

        this.mapEachField(
            doc,
            // all
            (p, data) => {
                if (data.hideGetId) {
                    delete p.obj[p.key]
                    return true
                } else if (!(p.key in p.obj)) {
                    if (data.default !== undefined) {
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
                    if (data.getIdKeepAsRef) {
                        return convertToKey(v)
                    } else if (this.db.isDBId(v)) {
                        // Dereference the id into an object
                        let subdoc = await data.foreignApi.getFromDB(
                            user,
                            depth++,
                            v
                        )
                        // Warps return values
                        if (data.distortOnGet) {
                            subdoc = data.distortOnGet(subdoc)
                        }
                        return subdoc
                    }
                }
                throw this.internal(
                    'getFromDB.mapForeignKeys',
                    `[${v}] expected to be a valid DB id`
                )
            },
            // data
            // Warp return values
            (v, data) => (data.distortOnGet ? data.distortOnGet(v) : v),
            // other
            async (v, data) => {
                if (typeof v === data.type) {
                    return v
                } else {
                    console.warn(`${v} is of incorrect type ${data}`)
                }
            },
            // parent
            (v, data) => {
                return v
            }
        )

        return doc
    }

    protected override async verifyAddedDocument(
        user: AuthUser,
        files: any,
        addDoc: Type,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        stack: string[]
    ): Promise<Type> {
        // Used for frontend mangement, redundant in DB
        // delete addDoc.id

        return super.verifyAddedDocument(
            user,
            files,
            addDoc,
            exists,
            map,
            stack
        )
    }

    public async create(user: AuthUser, files: any, doc: Type, real: boolean) {
        let id = this.db.generateDBID()
        user.id = id

        // The passed document has a parent key, so we need to
        // update the parent to include this document
        // if (this.parentKey && this.parentKey.local in doc) {
        //     // TODO
        // }

        // Turns a fully-dereferenced document into a reference
        // document
        let map = new Map<DataManager<any>, any[]>()
        let stack = [id]
        await this.verifyAddedDocument(user, files, doc, false, map, stack)

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
                    real && (await api.db.saveUnsafe(doc))
                }
            }
        } catch (err: any) {
            // Delete malformed documents
            console.error(`Error with saving: ${err}`)
            for (let [api, docs] of map) {
                if (!(api instanceof DBManager)) {
                    continue
                }
                for (let doc of docs) {
                    if ('_key' in doc) {
                        let k = doc._key as string
                        if (await api.db.exists(k)) {
                            console.log(`Removing malformed doc w/ id ${k}`)
                            await api.db.removeUnsafe(k)
                        }
                    } else {
                        throw this.error(
                            'create',
                            HTTPStatus.INTERNAL_SERVER_ERROR,
                            'Invalid system state',
                            `${JSON.stringify(doc)} lacks _key field`
                        )
                    }
                }
            }

            // If this is an APIError, pass control
            if (err instanceof APIError) {
                throw err
            }
            // Some other error type
            throw this.error(
                'create',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                JSON.stringify(err)
            )
        }

        return id
    }

    public async update(
        user: AuthUser,
        files: any,
        key: string,
        doc: Type,
        real: boolean
    ) {
        let id = this.db.keyToId(key)
        user.id = id

        // We dont need to update all elements, .update does that
        // automatically for us :)

        // TODO: update parent
        // if (this.parentKey) {
        //     //if ()
        // }

        let map = new Map<DataManager<any>, any[]>()
        let stack = [id]
        await this.verifyAddedDocument(user, files, doc, false, map, stack)

        real || console.log('FAKING UPDATE')
        // Updates each document in the map to its respective collection
        // TODO Delete/revert malformed docs
        for (let [api, docs] of map) {
            if (!(api instanceof DBManager)) {
                continue
            }
            for (let d of docs) {
                if (!d._key || !isDBKey(d._key)) {
                    throw this.error(
                        'create',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${d._key} invalid`
                    )
                }
                if (await api.db.exists(d._key)) {
                    console.log(
                        `Updating ${api.className} | ${JSON.stringify(d)}`
                    )
                    real &&
                        (await api.db.updateUnsafe(d, {
                            mergeObjects: false,
                        }))
                } else {
                    console.log(
                        `Saving ${api.className} | ${JSON.stringify(d)}`
                    )
                    real && (await api.db.saveUnsafe(d))
                }
            }
        }
    }

    /**
     * Deletes a document and all its associated documents
     * @param base True if this is the base call (ie the call that should
     *  update parent fields)
     */
    public async delete(
        user: AuthUser,
        key: string,
        real: boolean,
        base: boolean
    ) {
        let doc = await this.db.get(key)

        // Delete children
        doc = await this.mapForeignKeys(
            doc,
            async (k, data) => {
                if (typeof k !== 'string') {
                    throw this.error(
                        'delete.mapForeignKeys',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `[${k}] is not a string`
                    )
                }
                return data.foreignApi.delete(user, k, real, false)
            },
            (data) => !data.freeable
        )

        // Update parent
        // The original call is the only one that should update
        // the parent field
        if (base && this.parentField) {
            let localId = this.parentField.local
            if (localId in doc) {
                let parentId = (<any>doc)[localId]
                if (!this.db.isDBId(parentId)) {
                    throw this.error(
                        'delete',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `Parent id [${parentId}] invalid`
                    )
                }
                await getApiInstanceFromId(parentId).removeReference(
                    doc._id as string,
                    this.parentField.foreign,
                    real
                )
            } else {
                throw this.error(
                    'delete',
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    'Invalid system state',
                    `Parent id key ${this.className}.${localId} dne in ${doc}`
                )
            }
        }

        console.log(
            `${real ? 'DELETING' : 'FAKE DELETING'} ${
                this.className
            } | ${key} | ${doc}`
        )
        real && (await this.db.removeUnsafe(key))
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

            // Delete disowned children
            doc = await this.forEachField<IForeignFieldData>(
                doc,
                this.foreignEntries,
                async (p, k, d) => {
                    let c = d.foreignApi
                    if (!c.db.tryExists(k)) {
                        p.obj[p.key] = <any>''
                    }
                },
                async (p, a, d) => {
                    let c = d.foreignApi
                    for (var i = a.length - 1; i >= 0; i--) {
                        if (!c.db.tryExists(a[i])) {
                            a.splice(i, 1)
                        }
                    }
                },
                async (p, o, d) => {
                    let c = d.foreignApi
                    for (let k in o) {
                        let sAr = o[k]

                        if (!Array.isArray(sAr)) {
                            throw this.error(
                                'disown',
                                HTTPStatus.INTERNAL_SERVER_ERROR,
                                'Invalid system state',
                                `${sAr} is not an array`
                            )
                        }
                        for (var i = sAr.length - 1; i >= 0; i--) {
                            if (!c.db.tryExists(sAr[i])) {
                                sAr.splice(i, 1)
                            }
                        }
                        // Delete empty steps
                        if (sAr.length === 0) delete o[k]
                    }
                }
            )

            await this.db.updateUnsafe(doc, {
                mergeObjects: false,
            })
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

        return r
    }
}
