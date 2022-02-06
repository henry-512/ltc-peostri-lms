import { IModule } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { ApiRoute } from "./route";
import { TaskRouteInstance } from "./tasks";

class ModuleRoute extends ApiRoute<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            ['title', 'tasks', 'comments', 'project', 'status', 'steps'],
            false,
            [
                {key:'tasks', class:TaskRouteInstance},
		        {key:'comments', class:CommentRouteInstance}
            ],
            {local:'project', foreign:'modules'},
            []
        )
    }
}

export const ModuleRouteInstance = new ModuleRoute()
