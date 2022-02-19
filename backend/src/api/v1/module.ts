import { IModule } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { FileMetadataRouteInstance } from "./fileMetadata";
import { ApiRoute } from "./route";
import { TaskRouteInstance } from "./tasks";

class ModuleRoute extends ApiRoute<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            {
                'title':{type:'string'},
                'tasks':{type:'fkeyStep',freeable:true},
                'comments':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    freeable:true
                },
                'project':{type:'parent'},
                'status':{type:'string'},
                'waived':{
                    type:'boolean',
                    optional:true,
                    default:false
                },
                'file':{type:'fkey',optional:true,getIdKeepAsRef:true},
            },
            false,
            {
                'tasks': TaskRouteInstance,
		        'comments': CommentRouteInstance,
                'file': FileMetadataRouteInstance,
            },
            {local:'project',foreign:'modules'}
        )
    }
}

export const ModuleRouteInstance = new ModuleRoute()
