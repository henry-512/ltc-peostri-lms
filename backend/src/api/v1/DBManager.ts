import { IFieldData } from "../../lms/FieldData";
import { IArangoIndexes } from "../../lms/types";
import { splitId } from "../../lms/util";
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
    constructor(
        dbName: string,
        routeName: string,
        className: string,
        fields: {[key:string]: IFieldData},
        /**
         * Create/Update timestamp
         */
        protected hasCUTimestamp: boolean,
    ) {
        super(routeName, className, fields, hasCUTimestamp)
    }

}
