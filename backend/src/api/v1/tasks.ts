import { ITask } from "../../lms/types";
import { ApiRoute } from "./route";
import { RankRouteInstance } from "./ranks";
import { UserRouteInstance } from "./users";

class TaskRoute extends ApiRoute<ITask> {
    constructor() {
        super(
            'tasks',
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
                    foreignApi:UserRouteInstance,
                },
                'rank':{
                    type:'fkey',
                    optional:true,
                    getIdKeepAsRef:true,
                    foreignApi:RankRouteInstance,
                },
                'module':{
                    type:'parent',
                    acceptNewDoc:true,
                    parentReferenceKey:'tasks'
                },
                'type':{type:'string'}
            },
            false,
        )
    }
}

export const TaskRouteInstance = new TaskRoute()
