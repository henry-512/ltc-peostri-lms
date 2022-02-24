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
                // 'path':{type:'string',optional:true},
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
    protected override async modifyDoc(doc:any) {
        if (!('title' in doc && 'src' in doc)) {
            throw new TypeError(`${doc} is not a valid file reference`)
        }

        // lol
        // let blob:any = await fetch(doc.src).then(r => r.blob())
        // let blob:any = await new Promise((resolve, reject) => {
        //     let xhr = new XMLHttpRequest()
        //     xhr.open('GET', doc.src, true)
        //     xhr.responseType = 'blob'
        //     xhr.onload = (e) => {
        //         if (xhr.status == 200) {
        //             resolve(xhr.response)
        //         } else {
        //             reject()
        //         }
        //     }
        //     xhr.onerror = () => {
        //         reject()
        //     }
        //     xhr.send()
        // })

        // let blob:any = {}
        // blob.src = doc.src
        // blob.lastModifiedDate = new Date()
        // blob.name = doc.title

        let meta:any = {}
        meta.author = 'users/0123456789012345678900'
        meta.name = doc.title
        // meta.blob = blob

        return meta
    }
}

export const FileMetadataRouteInstance = new FileMetadataRoute()
