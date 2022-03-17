import fs from 'fs';
import path from 'path';

import { IFileMetadata } from "../../lms/types";
import { HTTPStatus } from "../../lms/errors";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";
import { AuthUser } from "../auth";
import { generateBase64UUID, generateDBID } from '../../lms/util';

const FILE_PATH = 'fs'

class FileMetadataRoute extends ApiRoute<IFileMetadata> {
    constructor() {
        super(
            'fileMetadata',
            'fileMetadata',
            'File Metadata',
            {
                'title':{type:'string'},
                'author':{type:'fkey'},
                'version':{
                    type:'string',
                    hideGetAll:true,
                    hideGetId:true,
                    hideGetRef:true,
                },
            },
            true,
            {
                'author': UserRouteInstance
            },
            null
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

    private async readFile(doc: IFileMetadata) {
        return fs.promises.readFile(
            path.join(FILE_PATH, `${doc.title}.${doc.version}`)
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

        let meta:IFileMetadata = {
            author: user.getId(),
            title: fd.title,
            version,
        }

        return meta
    }
}

interface IFileData {
    // Blob string
    rawFile:string,
    title:string,
}

export const FileMetadataRouteInstance = new FileMetadataRoute()
