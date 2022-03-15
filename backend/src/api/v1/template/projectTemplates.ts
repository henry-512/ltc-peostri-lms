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

    public override makeRouter() {
        let r = super.makeRouter()
        // Builds a project matching the passed project template ID
        r.get('/instance/:id', async (ctx, next) => {
            try {
                next()
            } catch (err) {
                console.log(err)
                ctx.status = 500
            }
        })
        return r
    }
}

export const ProjectTemplateRouteInstance = new ProjectTemplateRoute()
