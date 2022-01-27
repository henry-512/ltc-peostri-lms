import { IProject } from './api-types'
import { IDBProject } from './db-types'

/**
 * Converts a IDBProject from a db call to a IProject for manipulation
*/
export function projMap(doc: IDBProject): IProject {
    return {
        title: doc.title,
        created: new Date(doc.dateCreated),
        updated: new Date(doc.dateUpdated),
        status: doc.status,
        comments: [],
        modules: [],

        id: parseInt(doc._key)
    }
}
