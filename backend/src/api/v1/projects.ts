import { IProject } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { ModuleRouteInstance } from "./module";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class ProjectRoute extends ApiRoute<IProject> {
    constructor() {
        super(
            'projects',
            'Project',
            {
                'title':{type:'string'},
                'start':{type:'string'},
                'end':{type:'string'},
                'status':{type:'string',default:'AWAITING'},
                'comments':{
                    type:'fkeyArray',
                    default:[],
                    freeable:true
                },
                'modules':{type:'fkeyStep',freeable:true},
                'users':{
                    type:'fkeyArray',
                    getIdKeepAsRef:true,
                    denyNewDoc:true,
                },
            },
            true,
            {
                'comments': CommentRouteInstance,
                'modules': ModuleRouteInstance,
                'users': UserRouteInstance
            },
            null
        )
    }
}

export const ProjectRouteInstance = new ProjectRoute()
