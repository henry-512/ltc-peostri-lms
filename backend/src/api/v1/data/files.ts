import fs from 'fs'
import path from 'path'
import { config } from '../../../config'
import { IFile, IFilemeta } from '../../../lms/types'
import { generateBase64UUID, getUrl } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { IFileData } from './filemeta'

const FILE_PATH = path.join('fs')
export const FULL_FILE_PATH = path.resolve(config.basePath, FILE_PATH)
const FILE_404 = path.join('404.pdf')

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
                pathTo: {
                    type: 'string',
                    hidden: true,
                },
            },
            {
                hasCreate: true,
                defaultFilter: 'title',
            }
        )
    }

    public override async getFromDB(
        user: AuthUser,
        id: string,
        noDeref: boolean,
        userRoute: boolean
    ): Promise<IFile> {
        let f = await super.getFromDB(user, id, noDeref, userRoute)

        // Generate src path
        f.src = getUrl(`files/static/${f.id}/${f.title}`)

        return f
    }

    public override async convertIDtoKEY(
        user: AuthUser,
        doc: IFile
    ): Promise<IFile> {
        let f = await super.convertIDtoKEY(user, doc)

        // Generate src path
        f.src = getUrl(`files/static/${f.id}/${f.title}`)

        return f
    }

    // Write a new file from the file data
    public async writeFile(user: AuthUser, file: IFileData): Promise<IFile> {
        let key = generateBase64UUID()
        let pathTo: string = key + '-' + file.name

        // Move file from OS 'tmp' to the LMS 'fs' directory
        await fs.promises.rename(file.path, path.join(FULL_FILE_PATH, pathTo))

        return {
            id: this.db.keyToId(key),
            pathTo,
            title: file.name,
            author: user.id,
            createdAt: new Date().toJSON(),
        }
    }

    public async readLatest(user: AuthUser, doc: IFilemeta) {
        return this.readSource(user, (<IFile>doc.latest).pathTo)
    }

    public async read(user: AuthUser, id: string) {
        let pathTo = await this.db.getOneFaster<string>(id, 'pathTo')
        return this.readSource(user, pathTo)
    }

    public async readSource(user: AuthUser, pathTo: string) {
        let fullPath = path.join(FULL_FILE_PATH, pathTo ?? '')

        // Check if path exists
        if (fs.existsSync(fullPath)) {
            // Check if path is a file
            if ((await fs.promises.stat(fullPath)).isFile()) {
                return pathTo
            }
        }

        // If we're not on release filesystem, return 404.pdf
        if (!config.releaseFileSystem) {
            console.log(`File [${fullPath}] dne, using 404.pdf instead`)
            return FILE_404
        } else {
            throw this.internal('readLatest', `${fullPath} is not a file`)
        }
    }
}

export const FiledataManager = new Filedata()
