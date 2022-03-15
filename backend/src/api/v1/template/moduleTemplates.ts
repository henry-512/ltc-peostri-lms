import { IModuleTemplate } from "../../../lms/types";
import { ApiRoute } from "../route";

class ModuleTemplateRoute extends ApiRoute<IModuleTemplate> {
    constructor() {
        super(
            'moduleTemplates',
            'Module Template',
            {
                'title': { type:'string' },
                'description': { type:'string' },
                'tasks': { type:'object' },
                'waive_module': {
                    type:'boolean',
                    optional:true,
                },
            },
            false,
            {},
            null,
        )
    }
}

export const ModuleTemplateRouteInstance = new ModuleTemplateRoute()