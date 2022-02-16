import { ITask } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class TaskRoute extends ApiRoute<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            {
                'title':{type:'string'},
                'status':{type:'string',default:'AWAITING'},
                'users':{type:'fkeyArray',default:[]},
                'module':{type:'parent'},
                'type':{type:'string'}
            },
            false,
            {
                'users': UserRouteInstance
            },
            {local:'module',foreign:'tasks'}
        )
    }
}

export const TaskRouteInstance = new TaskRoute()
