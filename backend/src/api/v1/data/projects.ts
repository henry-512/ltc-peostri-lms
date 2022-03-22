import { IProject } from "../../../lms/types";
import { DBManager } from "../DBManager";
import { CommentManager } from "./comments";
import { ModuleManager } from "./modules";
import { UserManager } from "./users";

class Project extends DBManager<IProject> {
    constructor() {
        super(
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
                    type:'array',
                    instance:'fkey',
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentManager,
                },
                'modules':{
                    type:'step',
                    instance:'fkey',
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:ModuleManager,
                },
                'users':{
                    type:'array',
                    instance:'fkey',
                    default:[],
                    getIdKeepAsRef:true,
                    foreignApi:UserManager,
                },
            },
            true,
        )
    }
}

export const ProjectManager = new Project()
