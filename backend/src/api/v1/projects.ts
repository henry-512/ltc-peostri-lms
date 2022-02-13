import { IProject } from "../../lms/types";
import { CommentRouteInstance } from "./comments";
import { ModuleRouteInstance } from "./module";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class ProjectRoute extends ApiRoute<IProject> {
    constructor() {
        super(
            'projects',
            'Project',
            ['title', 'createdAt', 'updatedAt', 'start', 'end', 'status', 'comments', 'modules', 'users'],
            true,
            [
                {key:'comments', class:CommentRouteInstance,optional:true},
                {key:'modules', class:ModuleRouteInstance,optional:false},
                {key:'users', class:UserRouteInstance,optional:false}
            ],
            null,
            'modules'
        )
    }
}

export const ProjectRouteInstance = new ProjectRoute()
