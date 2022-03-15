import { IProjectTemplate } from "../../../lms/types";
import { ModuleTemplateRouteInstance } from "./moduleTemplates";
import { ApiRoute } from "../route";

class ProjectTemplateRoute extends ApiRoute<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            'template/projects',
            'Project Template',
            {
                'title': { type: 'string' },
                'description': { type: 'string' },
                'modules': { type: 'fkeyStep' },
            },
            false,
            {
                'modules': ModuleTemplateRouteInstance,
            },
            null,
        )
    }
}

export const ProjectTemplateRouteInstance = new ProjectTemplateRoute()
