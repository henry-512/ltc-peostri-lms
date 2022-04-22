import fs from 'fs'
import path from 'path'
import { config } from '../../../config'
import { IFile, IFilemeta } from '../../../lms/types'
import { generateBase64UUID } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { IFileData } from './filemeta'

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
                    managerName: 'users',
                },
                src: {
                    type: 'string',
                    hidden: true,
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

        // Spoof upload
        if (config.releaseFileSystem) {
            await fs.promises.rename(file.path, path.join(FILE_PATH, pathTo))
        }

        return {
            id: this.db.keyToId(id),
            src: pathTo,
            title: file.name,
            author: user.id,
        }
    }

    public async readLatest(user: AuthUser, doc: IFilemeta) {
        return this.readSource(user, (<IFile>doc.latest).src)
    }

    public async read(user: AuthUser, id: string) {
        let file = await this.db.get(id)
        return this.readSource(user, file.src)
    }

    public async readSource(user: AuthUser, src: string) {
        let pathTo = path.join(FILE_PATH, src ?? '')
        if ((await fs.promises.stat(pathTo)).isFile()) {
            return pathTo
        } else if (!config.releaseFileSystem) {
            console.log(`File ${pathTo} dne, using 404.pdf instead`)
            return path.join(FILE_PATH, '404.pdf')
        } else {
            throw this.internal('readLatest', `${pathTo} is not a file`)
        }
    }
}

export const FiledataManager = new Filedata()
