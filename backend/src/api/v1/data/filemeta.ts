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
            '_key',
            {
                latest: {
                    type: 'fkey',
                    foreignApi: FiledataManager,
                },
                old: {
                    type: 'array',
                    instance: 'fkey',
                    foreignApi: FiledataManager,
                },
                reviews: {
                    type: 'array',
                    instance: 'fkey',
                    foreignApi: FiledataManager,
                },
                oldReviews: {
                    type: 'array',
                    instance: 'fkey',
                    foreignApi: FiledataManager,
                },
                module: {
                    type: 'parent',
                    parentReferenceKey: 'files',
                },
            },
            { hasCUTimestamp: true }
        )
    }

    // Stores the passed file into the database
    protected override async buildFromString(
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ): Promise<IFilemeta | undefined> {
        if (!files[str]) {
            this.error(
                'buildFromString',
                HTTPStatus.BAD_REQUEST,
                'Unexpected file metadata',
                `${str} is not a valid file reference`
            )
        }

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
