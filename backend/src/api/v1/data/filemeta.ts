import { HTTPStatus } from '../../../lms/errors'
import { IFilemeta } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FiledataManager } from './files'

class Filemeta extends DBManager<IFilemeta> {
    constructor() {
        super(
            'filemeta',
            'File Metadata',
            {
                latest: {
                    type: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                },
                old: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                },
                reviews: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
                },
                oldReviews: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'files',
                    acceptNewDoc: true,
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
    ): Promise<IFilemeta> => {
        if (files[str] === undefined) {
            throw this.error(
                'buildFromString',
                HTTPStatus.BAD_REQUEST,
                'Unexpected file metadata',
                `${str} is not a valid file reference`
            )
        }

        // Strip the useful information out of the file
        let fileData: IFileData = files[str] as IFileData
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
