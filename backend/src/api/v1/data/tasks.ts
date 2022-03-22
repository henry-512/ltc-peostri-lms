import { ITask } from "../../../lms/types";
import { DBManager } from "../DBManager";
import { RankManager } from "./ranks";
import { UserManager } from "./users";

class Task extends DBManager<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            {
                'title':{type:'string'},
                'status':{
                    type:'string',
                    default:'AWAITING',
                },
                'users':{
                    type:'fkeyArray',
                    default:[],
                    getIdKeepAsRef:true,
                    foreignApi:UserManager,
                },
                'rank':{
                    type:'fkey',
                    optional:true,
                    getIdKeepAsRef:true,
                    foreignApi:RankManager,
                },
                'module':{
                    type:'parent',
                    parentReferenceKey:'tasks'
                },
                'type':{type:'string'}
            },
            false,
        )
    }
}

export const TaskManager = new Task()
