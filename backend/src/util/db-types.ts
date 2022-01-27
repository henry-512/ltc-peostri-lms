import { Status } from './api-types'

export interface IDBProject {
    _id: string,
    _key: string,
    _rev: string,

    dateCreated: string,
    dateUpdated: string,
    status: Status,
    title: string,

    // TODO: comment and module typedata
}
