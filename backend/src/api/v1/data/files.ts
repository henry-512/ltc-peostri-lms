import fs from 'fs'
import path from 'path'
import { config } from '../../../config'
import { IFile, IFilemeta } from '../../../lms/types'
import { generateBase64UUID } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { IFileData } from './filemeta'
import { UserManager } from './users'

const FILE_PATH = path.resolve(config.basePath, 'fs')

class Filedata extends DBManager<IFile> {
    constructor() {
        super(
            'files',
            'File',
            {
                title: { type: 'string' },
                author: {
                    type: 'fkey',
                    foreignApi: UserManager,
                },
                src: {
                    type: 'string',
                    hideGetAll: true,
                    hideGetId: true,
                    hideGetRef: true,
                },
            },
            {
                hasCreate: true,
                hasUpdate: true,
                defaultFilter: 'title',
            }
        )
    }

    // Write a new file from the file data
    public async writeFile(user: AuthUser, file: IFileData): Promise<IFile> {
        let id = generateBase64UUID()
        let pathTo: string = id + '-' + file.name

        await fs.promises.rename(file.path, path.join(FILE_PATH, pathTo))

        return {
            id,
            src: pathTo,
            title: file.name,
            author: user.id,
        }
    }

    public async readLatest(user: AuthUser, doc: IFilemeta) {
        let latest = await this.getFromDB(user, doc.latest as string)

        let pathTo = path.join(FILE_PATH, latest.src ?? '')
        let stat = await fs.promises.stat(pathTo)
        if (!stat.isFile) {
            this.internal('readLatest', `${pathTo} is not a file`)
        }

        return fs.promises.readFile(pathTo)
    }
}

export const FiledataManager = new Filedata()
