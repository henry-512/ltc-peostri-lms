import { IArangoIndexes } from "./types";
import { DataManager } from "../api/v1/DataManager";
import { DBManager } from "../api/v1/DBManager";

export interface IFieldData {
    type: 'string' | 'boolean' | 'number' | 'object' | 'parent' | 'fkey' | 'fkeyArray' | 'fkeyStep' | 'array';
    optional?: boolean;
    default?: any;
    hideGetAll?: boolean;
    hideGetId?: boolean;
    // True if this key should be shown in dereferenced docs
    hideGetRef?: boolean;
    // True if this key shouldn't be dereferenced
    getIdKeepAsRef?: boolean;
    // True if this foreign key should accept built documents
    acceptNewDoc?: boolean;
    // The foreign ApiRoute that manages this field
    foreignApi?: DBManager<IArangoIndexes>;
    // The foreign data that manages this field
    foreignData?: DataManager<any>;
    // If set, this key is a parent key pointing to the local key set in this document
    // ie. module is a parent of task.
    //   module[tasks] <-> task[module]
    //   so tasks.module.parentReferenceKey = tasks
    parentReferenceKey?: string;
    // True if this foreign object reference can be freely deleted
    freeable?: boolean;
}

export interface IForeignFieldData extends IFieldData {
    foreignApi: DBManager<IArangoIndexes>;
}
