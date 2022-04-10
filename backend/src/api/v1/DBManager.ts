import Router from '@koa/router'
import {
    ArangoWrapper,
    IFilterOpts,
    IGetAllQueryResults,
    IQueryGetOpts,
} from '../../database'
import { APIError, HTTPStatus } from '../../lms/errors'
import { IField, IForeignFieldData } from '../../lms/FieldData'
import { IArangoIndexes } from '../../lms/types'
import { convertToKey, splitId, str } from '../../lms/util'
import { AuthUser } from '../auth'
import { DataManager, Managers } from './DataManager'

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): DBManager<IArangoIndexes> {
    return Managers[splitId(id).col] as any
}

export class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {
    public db: ArangoWrapper<Type>
    private defaultFilter: string

    constructor(
        dbName: string,
        className: string,
        fields: { [key: string]: IField },
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

        this.db = new ArangoWrapper<Type>(dbName, this.fieldEntries)

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
            let filter = JSON.parse(q.filter)

            for (let [key, value] of Object.entries(filter)) {
                let f: IFilterOpts = { key }

                if (key === 'q') {
                    f.key = this.defaultFilter
                } else if (
                    !(key in this.fieldData) ||
                    this.fieldData[key].hideGetAll
                ) {
                    console.warn(`Invalid filtering id ${key}`)
                    console.warn(f)
                    continue
                }

                let data = this.fieldData[key]

                console.log(value)
                console.log(str(data))

                if (data.type === 'array') {
                    if (typeof value === 'string') {
                        if (data.foreignApi) {
                            f.inArray = data.foreignApi.db.keyToId(value)
                        } else {
                            f.inArray = value
                        }
                    } else {
                        console.warn(`Invalid filtering value [${value}]`)
                        continue
                    }
                } else if (Array.isArray(value)) {
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
                console.log(f)

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

        // range
        if (q.range && q.range.length == 2) {
            opts.range = {
                offset: parseInt(q.range[0]),
                count: Math.min(parseInt(q.range[1]), 50),
            }
        }

        return opts
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @return A cursor representing all db objects that fit the query
     */
    public async runQuery(opts: IQueryGetOpts): Promise<IGetAllQueryResults> {
        let query = await this.db.queryGet(opts)
        let all = await query.cursor.all()

        // Convert all document foreign ids to keys
        await Promise.all(all.map(async (doc) => this.convertIDtoKEY(doc)))

        return {
            all,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + Math.min(query.size, opts.range.count),
        }
    }

    /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @return A Type representing a document with key, with .id set and ._* removed
     */
    public async getFromDB(user: AuthUser, id: string): Promise<Type> {
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
                    } else if (data.foreignApi.db.isDBId(v)) {
                        // Dereference the id into an object
                        let subdoc = await data.foreignApi.getFromDB(user, v)
                        // Warps return values
                        if (data.distortOnGet) {
                            subdoc = data.distortOnGet(subdoc)
                        }
                        return subdoc
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
                await data.foreignData.convertIDtoKEY(v)
                return data.distortOnGet ? data.distortOnGet(v) : v
            },
            // other
            async (v, data) => {
                if (typeof v !== data.type) {
                    console.warn(`${v} is of incorrect type ${str(data)}`)
                }
                return v
            },
            // parent
            undefined
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
            console.error(`Error with saving: ${err}`)
            for (let [api, docs] of map) {
                if (!(api instanceof DBManager)) {
                    continue
                }
                for (let doc of docs) {
                    if (doc._key) {
                        doc.id = doc._key
                        delete doc._key
                    }

                    let id = doc.id

                    if (!id || !api.db.isDBId(id)) {
                        throw this.internal(
                            'create',
                            `${JSON.stringify(doc)} lacks id field`
                        )
                    }

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
        // console.log(JSON.stringify(doc, null, 2))

        // doc.id is a KEY here and needs to be converted
        doc.id = id

        // We dont need to update all elements, .update does that
        // automatically for us :)

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
                    real &&
                        (await api.db.update(d, {
                            mergeObjects: false,
                        }))
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
     * Deletes a document and all its associated documents
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
                return data.foreignApi.delete(user, v, real, false)
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
                    throw this.internal(
                        'delete',
                        `Parent id [${parentId}] invalid`
                    )
                }
                await getApiInstanceFromId(parentId).removeReference(
                    doc._id as string,
                    this.parentField.foreign,
                    real
                )
            } else {
                throw this.internal(
                    'delete',
                    `Parent id key ${this.className}.${localId} dne in ${doc}`
                )
            }
        }

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
                    let c = d.foreignApi
                    if (!(await c.db.tryExists(k))) {
                        p.obj[p.key] = <any>''
                    }
                },
                async (p, a, d) => {
                    let c = d.foreignApi
                    for (var i = a.length - 1; i >= 0; i--) {
                        if (!(await c.db.tryExists(a[i]))) {
                            a.splice(i, 1)
                        }
                    }
                },
                async (p, o, d) => {
                    let c = d.foreignApi
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

            await this.db.update(doc, {
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
    }
}
