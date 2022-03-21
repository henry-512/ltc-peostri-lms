import fs from 'fs';
import path from 'path';

import { IFile, IFilemeta } from "../../../lms/types";
import { ApiRoute } from "../route";
import { UserRouteInstance } from "./users";
import { AuthUser } from "../../auth";
import { generateBase64UUID } from '../../../lms/util';
import { HTTPStatus } from '../../../lms/errors';
import { config } from '../../../config';

const FILE_PATH = path.resolve(config.basePath, 'fs')

class Filedata extends ApiRoute<IFile> {
    constructor() {
        super(
            '', '',
            'File',
            {
                src: {type:'string'},
                title: {type:'string'},
                author: {
                    type:'fkey',
                    foreignApi: UserRouteInstance,
                },
            },
            true,
        )
    }
}

const FiledataInstance = new Filedata()

class FilemetaRoute extends ApiRoute<IFilemeta> {
    constructor() {
        super(
            'filemeta',
            'filemeta',
            'File Metadata',
            {
                'latest':{
                    type:'object',
                },
                'old':{
                    type:'array',
                },
                'module':{
                    type:'parent',
                    parentReferenceKey:'files'
                }
            },
            true,
        )
    }

    private async writeFile(
        user:AuthUser,
        file:IFileData,
    ) : Promise<IFile> {
        let id = generateBase64UUID()
        let src:string = id + '-' + file.name

        await fs.promises.rename(
            file.path,
            path.join(FILE_PATH, src),
        )

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
    ): Promise<IFilemeta | null> {
        if (!files[str]) {
            this.error(
                'buildFromString',
                HTTPStatus.BAD_REQUEST,
                'Unexpected file metadata',
                `${str} is not a valid file reference`,
            )
        }

        let fileData:IFileData = files[str] as IFileData
        let latest = await this.writeFile(user, fileData)

        return {
            latest,
            old: [],
            module: par,
        }
    }
}

interface IFileData {
    // Blob data
    size:number,
    path:string,
    name:string,
    // MIME media type
    type:string,
    mtime:string | Date,
}

export const FilemetaRouteInstance = new FilemetaRoute()
