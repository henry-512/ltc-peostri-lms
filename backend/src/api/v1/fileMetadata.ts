// import fetch from 'node-fetch';

import { IFileMetadata } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class FileMetadataRoute extends ApiRoute<IFileMetadata> {
    constructor() {
        super(
            'fileMetadata',
            'File Metadata',
            {
                'name':{type:'string'},
                'author':{type:'fkey'},
                'blob':{type:'object'},
            },
            true,
            {
                'author': UserRouteInstance
            },
            null
        )
    }

    // Doc of format
    /*
    {
        rawFile: {path: "string.pdf"},
        src: "blob:http://localhost:3000/uuid",
        title: "string.pdf"
    }
     */
    protected override async modifyDoc(doc:any, par:string) {
        if (!('title' in doc && 'src' in doc)) {
            throw new TypeError(`${doc} is not a valid file reference`)
        }

        // let blob:any = await fetch(doc.src).then(r => r.blob())

        // blob.lastModifiedDate = new Date()
        // blob.name = doc.title

        let meta:any = {}
        meta.author = 'users/0123456789012345678900'
        meta.name = doc.title
        // meta.blob = blob
        meta.blob = doc.src

        return meta
    }
}

export const FileMetadataRouteInstance = new FileMetadataRoute()
