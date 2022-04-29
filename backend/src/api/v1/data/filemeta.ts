import { HTTPStatus } from '../../../lms/errors'
import { IFileRevisions } from '../../../lms/types'
import { getFile } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FiledataManager } from './files'

/** File metadata */
export class Filemeta extends DBManager<IFileRevisions> {
    constructor() {
        super(
            'filemeta',
            'File Metadata',
            {
                latest: {
                    type: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                    overrideUserDeref: true,
                    freeable: true,
                },
                old: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                    overrideUserDeref: true,
                    freeable: true,
                },
                reviews: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                    overrideUserDeref: true,
                    freeable: true,
                },
                oldReviews: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                    overrideUserDeref: true,
                    freeable: true,
                },
                module: {
                    type: 'parent',
                    managerName: 'modules',
                    parentReferenceKey: 'files',
                },
            },
            { hasCreate: true }
        )
    }

    // Stores the passed file into the database
    protected override buildFromString = async (
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ): Promise<IFileRevisions> => {
        if (files[str] === undefined) {
            throw this.error(
                'buildFromString',
                HTTPStatus.BAD_REQUEST,
                'Unexpected file metadata',
                `${str} is not a valid file reference`
            )
        }

        // Strip the useful information out of the file
        let fileData = getFile(files, str)
        let latest = await FiledataManager.writeFile(user, fileData)

        return {
            id: this.db.generateDBID(),
            latest,
            reviews: [],
            old: [],
            oldReviews: [],
            module: par,
        }
    }

    public pushLatest(filemeta: IFileRevisions, fileId: string) {
        filemeta.old = (<string[]>filemeta.old).concat(<string>filemeta.latest)
        filemeta.latest = fileId
    }
}

export interface IFileData {
    // Blob data
    size: number
    path: string
    name: string
    // MIME media type
    type: string
    mtime: string | Date
}

export const FilemetaManager = new Filemeta()
