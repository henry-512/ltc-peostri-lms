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
                    type:'fkeyArray',
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentManager,
                },
                'modules':{
                    type:'fkeyStep',
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:ModuleManager,
                },
                'users':{
                    type:'fkeyArray',
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
