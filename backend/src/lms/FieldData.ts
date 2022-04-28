import { DataManager } from '../api/v1/DataManager'
import { DBManager } from '../api/v1/DBManager'
import { IArangoIndexes } from './types'

/**
 * An object representation of the metadata for each document field. This is
 * used to dynamically build routes, parse inputs, and convert raw database data
 * into clean inputs.
 */
export interface IFieldData {
    /** The type of the field */
    type:
        | 'string'
        | 'boolean'
        | 'number'
        | 'parent'
        | 'data'
        | 'fkey'
        | 'array'
        | 'step'
    /** Name of this field. Optional, but should always be set. */
    name?: string
    /** If type is an array or step, this is the type of that array or step */
    instance?: 'fkey' | 'data'

    /**
     * String name of the manager for this type. Used for dependency map
     * resolving and is removed afterwards.
     */
    managerName?: string

    /** Set if this is a dummy field (dne in database) */
    dummy?: boolean
    /** True if this field is optional */
    optional?: boolean
    /**
     * True if this field has a default value. This will added to the document
     * on GET, POST, and PUT requests if the field is missing.
     */
    default?: any
    /** True if this field should be hidden on GET-ALL requests */
    hideGetAll?: boolean
    /** True if this field should be hidden on GET requests */
    hideGetId?: boolean
    /** True if this field is hidden and should not be referenced */
    hidden?: boolean
    /** True if this key should be shown in dereferenced docs */
    hideGetRef?: boolean
    /** True if this key shouldn't be dereferenced */
    getIdKeepAsRef?: boolean
    /** True if this foreign key should accept built documents */
    acceptNewDoc?: boolean
    /** The foreign ApiRoute that manages this field */
    foreignManager?: DBManager<IArangoIndexes>
    /** The foreign data that manages this field */
    dataManager?: DataManager<any>
    /** Parent ApiRoute */
    parentManager?: DBManager<IArangoIndexes>
    /**
     * If set, this key is a parent key pointing to the local key set in this
     * document ie. module is a parent of task. IE: module[tasks] <->
     * task[module] so tasks.module.parentReferenceKey = tasks
     */
    parentReferenceKey?: string
    /** True if this foreign object reference can be freely deleted */
    freeable?: boolean
    /** If field is missing on user routes, send this instead */
    userDefault?: any

    /**
     * If true, dereference this field if the GET is a user route and deref is
     * disabled
     */
    overrideUserDeref?: boolean
}

/** Guarantees that `foreignManager` is set */
export interface IForeignFieldData extends IFieldData {
    foreignManager: DBManager<IArangoIndexes>
}

/** Guarantees that `dataManager` is set */
export interface IDataFieldData extends IFieldData {
    dataManager: DataManager<any>
}
