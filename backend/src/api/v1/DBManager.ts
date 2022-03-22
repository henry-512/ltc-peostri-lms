import { ArangoWrapper, IQueryGetOpts } from "../../database";
import { HTTPStatus } from "../../lms/errors";
import { IFieldData } from "../../lms/FieldData";
import { IArangoIndexes } from "../../lms/types";
import { splitId } from "../../lms/util";
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
    private db: ArangoWrapper<Type>

    constructor(
        dbName: string,
        routeName: string,
        className: string,
        fields: {[key:string]: IFieldData},
        /**
         * Create/Update timestamp
         */
        hasCUTimestamp: boolean,
    ) {
        super(routeName, className, fields, hasCUTimestamp)

        this.db = new ArangoWrapper<Type>(dbName, this.fieldEntries)
    }

    /**
     * Retrieves a query from the server, following the passed parameters.
     * @param q An object with query fields.
     *  - sort [id, ASC/DESC]
     *  - range [offset, count]
     * @return A cursor representing all db objects that fit the query 
     */
    protected async query(q: any) {
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

        /**
     * Gets the document with the passed key from the database
     * @param id A (valid) db id for the document
     * @param dereference If true, dereference all foreign keys in this and all other documents
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
            }
        }

        return this.mapForeignKeys(doc, async (k,data) => {
            if (typeof k === 'string') {
                // if (data.getIdKeepAsRef) {
                //     return convertToKey(k)
                // // Dereference the id into an object
                // } else if (db.isDBId(k)) {
                //     return this.getForeignApi(data).getFromDB(user, depth++, k)
                // }
            }
            throw this.error(
                'getFromDB.mapForeignKeys',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid document status',
                `[${k}] expected to be a valid DB id`
            )
        })
    }
}
