import { DataManager } from '../api/v1/DataManager'
import { DBManager } from '../api/v1/DBManager'
import { IArangoIndexes } from './types'

export interface IField {
    type:
        | 'string'
        | 'boolean'
        | 'number'
        | 'parent'
        | 'data'
        | 'fkey'
        | 'array'
        | 'step'
    // Name of this field
    name?: string

    // String name of the manager for this type. Used for dependency map resolving and is removed afterwards
    managerName?: string

    // Set if this is a dummy field (dne in database)
    dummy?: boolean
    // If type is an array or step, this is the type of that array or step
    instance?: 'fkey' | 'data'
    optional?: boolean
    default?: any
    hideGetAll?: boolean
    hideGetId?: boolean
    // True if this field is hidden and should not be referenced
    hidden?: boolean
    // True if this key should be shown in dereferenced docs
    hideGetRef?: boolean
    // True if this key shouldn't be dereferenced
    getIdKeepAsRef?: boolean
    // True if this foreign key should accept built documents
    acceptNewDoc?: boolean
    // The foreign ApiRoute that manages this field
    foreignApi?: DBManager<IArangoIndexes>
    // The foreign data that manages this field
    foreignData?: DataManager<any>
    // Parent ApiRoute
    parentManager?: DBManager<IArangoIndexes>
    // If set, this key is a parent key pointing to the local key set in this document
    // ie. module is a parent of task.
    //   module[tasks] <-> task[module]
    //   so tasks.module.parentReferenceKey = tasks
    parentReferenceKey?: string
    // True if this foreign object reference can be freely deleted
    freeable?: boolean
    // If set, distort this field's value on GET
    distortOnGet?: (doc: any) => any
}

export interface IForeignFieldData extends IField {
    foreignApi: DBManager<IArangoIndexes>
}

export interface IDataFieldData extends IField {
    foreignData: DataManager<any>
}
