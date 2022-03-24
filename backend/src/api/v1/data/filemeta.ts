import fs from 'fs'
import path from 'path'
import { config } from '../../../config'
import { HTTPStatus } from '../../../lms/errors'
import { IFile, IFilemeta } from '../../../lms/types'
import { generateBase64UUID } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

const FILE_PATH = path.resolve(config.basePath, 'fs')

const FiledataInstance = new DataManager<IFile>(
    'File',
    {
        src: { type: 'string' },
        title: { type: 'string' },
        author: {
            type: 'fkey',
            foreignApi: UserManager,
        },
    },
    {
        hasCUTimestamp: true,
    }
)

class Filemeta extends DBManager<IFilemeta> {
    constructor() {
        super(
            'filemeta',
            'File Metadata',
            {
                latest: {
                    type: 'data',
                    foreignData: FiledataInstance,
                },
                old: {
                    type: 'array',
                    instance: 'data',
                    foreignData: FiledataInstance,
                },
                module: {
                    type: 'parent',
                    parentReferenceKey: 'files',
                },
            },
            {
                hasCUTimestamp: true,
            }
        )
    }

    private async writeFile(user: AuthUser, file: IFileData): Promise<IFile> {
        let id = generateBase64UUID()
        let src: string = id + '-' + file.name

        await fs.promises.rename(file.path, path.join(FILE_PATH, src))

        return {
            src,
            title: file.name,
            author: user.getId(),
        }
    }

    public async readLatest(doc: IFilemeta) {
        let src = path.join(FILE_PATH, doc.latest.src)
        let stat = await fs.promises.stat(src)
        if (!stat.isFile) {
            this.error(
                'readLatest',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `${src} is not a file`
            )
        }

        return fs.promises.readFile(src)
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
        let latest = await this.writeFile(user, fileData)

        return {
            id: this.db.generateDBID(),
            latest,
            old: [],
            module: par,
        }
    }
}

interface IFileData {
    // Blob data
    size: number
    path: string
    name: string
    // MIME media type
    type: string
    mtime: string | Date
}

export const FilemetaManager = new Filemeta()
