import fs from 'fs';
import path from 'path';

import { IFile, IFilemeta } from "../../lms/types";
import { HTTPStatus } from "../../lms/errors";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";
import { AuthUser } from "../auth";
import { generateBase64UUID, generateDBID } from '../../lms/util';

const FILE_PATH = 'fs'

class Filedata extends ApiRoute<IFile> {
    constructor() {
        super(
            '', '',
            'File',
            {
                src: {type:'string'},
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
                'title':{type:'string'},
                'latest':{type:'fkey'},
                'old':{
                    type:'fkeyArray',
                }
            },
            true,
        )
    }

    private async writeFile(title:string, blob:string) {
        let id = generateBase64UUID()

        await fs.promises.writeFile(
            path.join(FILE_PATH, `${title}.${id}`),
            Buffer.from(blob, 'base64')
        )

        return id
    }

    private async readFile(doc: IFilemeta) {
        return fs.promises.readFile(
            // path.join(FILE_PATH, `${doc.title}.${doc.version}`)
            path.join(FILE_PATH, doc.title)
        )
    }

    // Stores the passed document in the database
    protected override async modifyDoc(
        user: AuthUser,
        doc: any,
        id: string,
    ): Promise<any> {
        let fd:IFileData = doc as IFileData

        // Trim blob header
        let blobData = fd.rawFile.slice(fd.rawFile.indexOf('base64,') + 7)

        let version = await this.writeFile(fd.title, blobData)

        let meta:IFilemeta = {
            // author: user.getId(),
            title: fd.title,
            latest: {} as any,
            old: []
        }

        return meta
    }
}

interface IFileData {
    // Blob string
    rawFile:string,
    title:string,
}

export const FilemetaRouteInstance = new FilemetaRoute()
