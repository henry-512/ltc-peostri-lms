import { IFileMetadata } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class FileMetadataRoute extends ApiRoute<IFileMetadata> {
    constructor() {
        super(
            'fileMetadata',
            'File Metadata',
            ['name', 'author', 'createdAt', 'location'],
            true,
            [
                {key:'author', class:UserRouteInstance, optional:false}
            ],
            null,
            null
        )
    }
}

export const FileMetadataRouteInstance = new FileMetadataRoute()
