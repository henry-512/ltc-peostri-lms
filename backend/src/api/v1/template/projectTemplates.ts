import { IModule, IProject, IProjectTemplate } from "../../../lms/types";
import { ModuleTemplateRouteInstance } from "./moduleTemplates";
import { ApiRoute } from "../route";
import { isDBId } from "../../../lms/util";

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

    private async buildProjectFromId(id:string) {
        let template = await this.getUnsafe(id)
        return this.buildProjectFromTemplate(template)
    }

    private async buildProjectFromTemplate(temp:IProjectTemplate): Promise<IProject> {
        let mods: {[id:string]: IModule[]} = {}

        for (let [stepName,tempArray] of Object.entries(temp.modules)) {
            mods[stepName] = await Promise.all(tempArray.map(async (i) => {
                if (typeof i !== 'string') {
                    throw new TypeError(`${i} is not a string`)
                }
                if (!isDBId(i)) {
                    throw new TypeError(`${i} is not a valid db id`)
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
            try {
                if (!this.exists(ctx.params.id)) {
                    ctx.body = this.buildProjectFromId(ctx.params.id)
                    ctx.status = 200
                } else {
                    ctx.status = 404
                    ctx.body = `${this.displayName} [${ctx.params.id}] dne.`
                }
                
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
