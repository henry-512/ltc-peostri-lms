import fs from 'fs';
import path from 'path';

import { IFile, IFilemeta } from "../../../lms/types";
import { UserManager } from "./users";
import { AuthUser } from "../../auth";
import { generateBase64UUID } from '../../../lms/util';
import { HTTPStatus } from '../../../lms/errors';
import { config } from '../../../config';
import { DBManager } from '../DBManager';
import { DataManager } from '../DataManager';

const FILE_PATH = path.resolve(config.basePath, 'fs')

class Filedata extends DataManager<IFile> {
    constructor() {
        super(
            'File',
            {
                src: {type:'string'},
                title: {type:'string'},
                author: {
                    type:'fkey',
                    foreignApi: UserManager,
                },
            },
            true,
        )
    }
}

const FiledataInstance = new Filedata()

class Filemeta extends DBManager<IFilemeta> {
    constructor() {
        super(
            'filemeta',
            'File Metadata',
            {
                'latest':{
                    type:'data',
                    foreignData: FiledataInstance,
                },
                'old':{
                    type:'array',
                    instance: 'data',
                    foreignData: FiledataInstance,
                },
                'module':{
                    type:'parent',
                    parentReferenceKey:'files'
                }
            },
            true,
        )
    }

    public override async getFromDB(user: AuthUser, depth: number, id: string) : Promise<IFilemeta> {
        if (depth === 0) {
            return super.getFromDB(user, depth, id)
        }

        let doc = await this.db.get(id)

        // :)
        return {
            src: `api/v1/files/${id}`,
            title: doc.latest.title,
        } as any
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
        par: string,
    ): Promise<IFilemeta | undefined> {
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
            id: this.db.generateDBID(),
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

export const FilemetaManager = new Filemeta()
