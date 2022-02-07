import { ITask } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class TaskRoute extends ApiRoute<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            ['title', 'status', 'assigned', 'module', 'type'],
            false,
            [
                {key:'assigned', class:UserRouteInstance}
            ],
            {local:'module',foreign:'tasks'},
            []
        )
    }
}

export const TaskRouteInstance = new TaskRoute()
