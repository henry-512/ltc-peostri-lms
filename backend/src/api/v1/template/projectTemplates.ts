import { IModule, IProject, IProjectTemplate } from "../../../lms/types";
import { ModuleTemplateRouteInstance } from "./moduleTemplates";
import { ApiRoute } from "../route";
import { isDBId } from "../../../lms/util";
import { HTTPStatus } from "../../../lms/errors";

class ProjectTemplateRoute extends ApiRoute<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            'template/projects',
            'Project Template',
            {
                'title': { type: 'string' },
                'description': { type: 'string' },
                'modules': {
                    type: 'fkeyStep',
                    foreignApi: ModuleTemplateRouteInstance,
                },
            },
            false,
        )
    }

    private async buildProjectFromId(id:string) {
        let template = await this.getUnsafe(id)
        return this.buildProjectFromTemplate(template)
    }

    private async buildProjectFromTemplate(temp:IProjectTemplate): Promise<IProject> {
        let mods: {[id:string]: IModule[]} = {}

        for (let [stepName,tempArray] of Object.entries(temp.modules)) {
            mods[stepName] = await Promise.all(tempArray.map(async (i) => {
                if (typeof i !== 'string') {
                    throw this.error(
                        'buildProjectFromTemplate',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${i} is not a string`
                    )
                }
                if (!isDBId(i)) {
                    throw this.error(
                        'buildProjectFromTemplate',
                        HTTPStatus.INTERNAL_SERVER_ERROR,
                        'Invalid system state',
                        `${i} is not a valid db id`
                    )
                }
                return ModuleTemplateRouteInstance.buildModuleFromId(i)
            }))
        }

        return {
            title: temp.title,
            start: new Date().toJSON(),
            end: new Date().toJSON(),
            status: 'AWAITING',
            comments: [],
            modules: mods,
            users: [],
        }
    }

    public override makeRouter() {
        let r = super.makeRouter()
        // Builds a project matching the passed project template ID
        r.get('/instance/:id', async (ctx, next) => {
            if (!this.exists(ctx.params.id)) {
                ctx.body = this.buildProjectFromId(ctx.params.id)
                ctx.status = HTTPStatus.OK
            } else {
                ctx.status = HTTPStatus.NOT_FOUND
                ctx.body = `${this.displayName} [${ctx.params.id}] dne`
            }
            
            next()
        })
        return r
    }
}

export const ProjectTemplateRouteInstance = new ProjectTemplateRoute()
