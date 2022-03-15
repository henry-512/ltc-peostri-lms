import { IProject } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { ModuleRouteInstance } from "./modules";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class ProjectRoute extends ApiRoute<IProject> {
    constructor() {
        super(
            'projects',
            'projects',
            'Project',
            {
                'title':{type:'string'},
                'start':{type:'string'},
                'end':{type:'string'},
                'status':{
                    type:'string',
                    default:'AWAITING'
                },
                'comments':{
                    type:'fkeyArray',
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                },
                'modules':{
                    type:'fkeyStep',
                    freeable:true,
                    acceptNewDoc:true,
                },
                'users':{
                    type:'fkeyArray',
                    default:[],
                    getIdKeepAsRef:true,
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
