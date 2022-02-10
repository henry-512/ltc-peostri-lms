import { ITask } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class TaskRoute extends ApiRoute<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            ['title', 'status', 'users', 'module', 'type'],
            false,
            [
                {key:'users', class:UserRouteInstance}
            ],
            {local:'module',foreign:'tasks'},
            null
        )
    }
}

export const TaskRouteInstance = new TaskRoute()
