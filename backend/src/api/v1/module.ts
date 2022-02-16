import { IModule } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { ApiRoute } from "./route";
import { TaskRouteInstance } from "./tasks";

class ModuleRoute extends ApiRoute<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            {
                'title':{type:'string'},
                'tasks':{type:'fkeyStep'},
                'comments':{type:'fkeyArray',optional:true,default:{}},
                'project':{type:'fkey'},
                'status':{type:'string'},
                'waived':{type:'boolean'}
            },
            false,
            {
                'tasks': TaskRouteInstance,
		        'comments': CommentRouteInstance
            },
            {local:'project',foreign:'modules'}
        )
    }
}

export const ModuleRouteInstance = new ModuleRoute()
