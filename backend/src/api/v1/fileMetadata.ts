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
                'location':{type:'string'}
            },
            true,
            {
                'author': UserRouteInstance
            },
            null
        )
    }
}

export const FileMetadataRouteInstance = new FileMetadataRoute()
