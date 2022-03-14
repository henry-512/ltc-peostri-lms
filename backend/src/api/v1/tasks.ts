import { ITask } from "../../lms/types";
import { ApiRoute } from "./route";
import { RankRouteInstance } from "./ranks";
import { UserRouteInstance } from "./users";

class TaskRoute extends ApiRoute<ITask> {
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
                },
                'rank':{
                    type:'fkey',
                    optional:true,
                    getIdKeepAsRef:true,
                },
                'module':{
                    type:'parent',
                    acceptNewDoc:true,
                },
                'type':{type:'string'}
            },
            false,
            {
                'users': UserRouteInstance,
                'rank': RankRouteInstance,
            },
            {local:'module',foreign:'tasks'}
        )
    }
}

export const TaskRouteInstance = new TaskRoute()
