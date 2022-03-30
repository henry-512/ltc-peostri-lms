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
            'file',
            'File',
            'title',
            {
                title: { type: 'string' },
                author: {
                    type: 'fkey',
                    foreignApi: UserManager,
                },
                src: { type: 'string' },
                path: {
                    type: 'string',
                    hideGetAll: true,
                    hideGetId: true,
                    hideGetRef: true,
                },
            },
            {
                hasCUTimestamp: true,
            }
        )
    }

    public async writeFile(user: AuthUser, file: IFileData): Promise<IFile> {
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
        let latest = await this.getFromDB(
            {} as any,
            doc.latest as string
        )

        let src = path.join(FILE_PATH, latest.path ?? '')
        let stat = await fs.promises.stat(src)
        if (!stat.isFile) {
            this.internal('readLatest', `${src} is not a file`)
        }

        return fs.promises.readFile(src)
    }
}

export const FiledataManager = new Filedata()
