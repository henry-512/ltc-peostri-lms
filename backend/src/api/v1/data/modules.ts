import { IModule } from "../../../lms/types";
import { CommentRouteInstance } from "./comments";
import { FilemetaRouteInstance } from "./filemeta";
import { ApiRoute } from "../route";
import { TaskRouteInstance } from "./tasks";

class ModuleRoute extends ApiRoute<IModule> {
    constructor() {
        super(
            'modules',
            'modules',
            'Module',
            {
                'title':{type:'string'},
                'tasks':{
                    type:'fkeyStep',
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:TaskRouteInstance,
                },
                'comments':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentRouteInstance,
                },
                'project':{
                    type:'parent',
                    parentReferenceKey:'modules'
                },
                'status':{
                    type:'string',
                    default: 'AWAITING'
                },
                'waive_module':{
                    type:'boolean',
                    optional:true,
                    default:false
                },
                'files':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    getIdKeepAsRef:true,
                    acceptNewDoc:true,
                    foreignApi:FilemetaRouteInstance
                },
            },
            false,
        )
    }
}

export const ModuleRouteInstance = new ModuleRoute()
