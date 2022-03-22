import { config } from "../../config";
import { ArangoWrapper, IQueryGetOpts } from "../../database";
import { APIError, HTTPStatus } from "../../lms/errors";
import { IFieldData, IForeignFieldData } from "../../lms/FieldData";
import { IArangoIndexes, ICreateUpdate } from "../../lms/types";
import { convertToKey, isDBKey, splitId } from "../../lms/util";
import { AuthUser } from "../auth";
import { DataManager } from "./DataManager";

/**
 * Returns the ApiRoute instance corresponding to a database id
 * @param id A db id of the form [name/id]
 * @returns The corresponding ApiRoute
 */
export function getApiInstanceFromId(id: string): DBManager<IArangoIndexes> {
    return instances[splitId(id).col]
}
const instances: {[dbname:string]: DBManager<IArangoIndexes>} = {}

export abstract class DBManager<Type extends IArangoIndexes> extends DataManager<Type> {
    public db: ArangoWrapper<Type>

    constructor(
        dbName: string,
        className: string,
        fields: {[key:string]: IFieldData},
        /**
         * Create/Update timestamp
         */
        hasCUTimestamp: boolean,
    ) {
        fields['id'] = {
            type: 'string',
            optional: true,
        }

        super(className, fields, hasCUTimestamp)

        this.db = new ArangoWrapper<Type>(dbName, this.fieldEntries)
    }

    public async exists(id: string) {
        return this.db.exists(id)
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param q An object with query fields.
     *  - sort [id, ASC/DESC]
     *  - range [offset, count]
     * @return A cursor representing all db objects that fit the query 
     */
    public async query(q: any) {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            }
        }

        // let filterIds:string[] = []
        // TODO: implement generic filtering
        // if (q.filter) {
        //     let filter = JSON.parse(q.filter)
        //     if (filter) {
        //         if ('id' in filter && Array.isArray(filter.id)) {
        //             filterIds = filter.id.map((s:string) => convertToKey(s))
        //         }
        //     }
        // }

        // Sorting
        if (q.sort && q.sort.length == 2) {
            let key: string = q.sort[0]

            if (
                !(key in this.fieldData)
                || this.fieldData[key].hideGetAll
            ) {
                throw this.error(
                    'query',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid sorting query',
                    `[${key}] is not a key of this`
                )
            }

            let dir: 'ASC' | 'DESC'

            switch(q.sort[1]) {
                case 'ASC':
                case 'DESC':
                    dir = q.sort[1]
                    break
                default:
                    throw this.error(
                        'query',
                        HTTPStatus.BAD_REQUEST,
                        'Invalid sorting query',
                        `[${q.sort[1]}] is not a valid direction`
                    )
            }

            opts.sort = { key, dir }
        }

        if (q.range && q.range.length == 2) {
            opts.range = {
                offset: parseInt(q.range[0]),
                count: Math.min(parseInt(q.range[1]), 50),
            }
        }

        let query = await this.db.queryGet(opts)

        return {
            cursor: query.cursor,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + opts.range.count,
        }
    }

    public convertIds(doc: Type) {
        return this.mapForeignKeys(doc, async (k,d) => {
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
        id: string,
    ) : Promise<Type> {
        let doc = await this.db.get(id)

        for (let [k, data] of this.fieldEntries) {
            if (data.hideGetId) {
                delete (<any>doc)[k]
            } else if (data.default !== undefined) {
                // Put default value in
                (<any>doc)[k] = data.default
            }
        }

        return this.mapForeignKeys(doc, async (k,data) => {
            if (typeof k === 'string') {
                if (data.getIdKeepAsRef) {
                    return convertToKey(k)
                // Dereference the id into an object
                } else if (this.db.isDBId(k)) {
                    // AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
                    // TODO: perfect spot to intercept calls
                    return data.foreignApi.getFromDB(user, depth++, k)
                }
            }
            throw this.internal(
                'getFromDB.mapForeignKeys',
                `[${k}] expected to be a valid DB id`
            )
        })
    }

    protected override async verifyAddedDocument(
        user: AuthUser,
        files: any,
        addDoc: Type,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        stack: string[],
    ): Promise<Type> {
        // Used for frontend mangement, redundant in DB
        // delete addDoc.id

        return super.verifyAddedDocument(
            user,
            files,
            addDoc,
            exists,
            map,
            stack,
        )
    }

    public async create(
        user: AuthUser,
        files: any,
        doc: Type,
        real: boolean
    ) {
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
        let stack = [ id ]
        await this.verifyAddedDocument(user, files, doc, false, map, stack)

        real || console.log('FAKING CREATE')
        // Saves each document in the map to its respective collection
        try {
            for (let [api, docs] of map) {
                if (!(api instanceof DBManager)) {
                    continue
                }
                for (let doc of docs) {
                    console.log(`Saving ${api.className} | ${JSON.stringify(doc)}`)
                    real && await api.db.saveUnsafe(doc)
                }
            }
        } catch (err:any) {
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
        let stack = [ id ]
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
                    console.log(`Updating ${api.className} | ${JSON.stringify(d)}`)
                    real && await api.db.updateUnsafe(d, {
                        mergeObjects: false
                    })
                } else {
                    console.log(`Saving ${api.className} | ${JSON.stringify(d)}`)
                    real && await api.db.saveUnsafe(d)
                }
            }
        }
    }

    /**
     * Deletes a document and all its associated documents
     * @param base True if this is the base call (ie the call that should
     *  update parent fields)
     */
    public async delete(user: AuthUser, key: string, real: boolean, base: boolean) {
        let doc = await this.db.get(key)

        // Delete children
        doc = await this.mapForeignKeys(doc, async(k,data) => {
            if (typeof k !== 'string') {
                throw this.error(
                    'delete.mapForeignKeys',
                    HTTPStatus.INTERNAL_SERVER_ERROR,
                    'Invalid system state',
                    `[${k}] is not a string`
                )
            }
            return data.foreignApi.delete(user, k, real, false)
        }, (data) => !data.freeable)

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
                await getApiInstanceFromId(parentId)
                    .removeReference(
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

        console.log(`${real ? 'DELETING' : 'FAKE DELETING'} ${this.className} | ${key} | ${doc}`)
        real && await this.db.removeUnsafe(key)
    }
}
