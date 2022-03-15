import { IModule, IModuleTemplate } from "../../../lms/types";
import { ApiRoute } from "../route";

class ModuleTemplateRoute extends ApiRoute<IModuleTemplate> {
    constructor() {
        super(
            'moduleTemplates',
            'template/modules',
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

    public buildModuleFromTemplate(temp:IModuleTemplate):IModule {
        let module:IModule = {
            title: temp.title,
            tasks: {},
            comments: [],
            status: 'IN_PROGRESS',
            waive_module: temp.waive_module,
            file: ""
        }

        return module
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

export const ModuleTemplateRouteInstance = new ModuleTemplateRoute()