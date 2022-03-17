import { HTTPStatus } from "../../../lms/errors";
import { IModule, IModuleTemplate, ITask } from "../../../lms/types";
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

    public async buildModuleFromId(id:string): Promise<IModule> {
        let template = await this.getUnsafe(id)
        return this.buildModuleFromTemplate(template)
    }

    private buildModuleFromTemplate(temp:IModuleTemplate):IModule {
        let tasks:{[key:string]:ITask[]} = {}

        for (let [stepName,tempArray] of Object.entries(temp.tasks)) {
            tasks[stepName] = tempArray.map((t) => {
                return {
                    title: '',
                    status: 'AWAITING',
                    users: [],
                    rank: t.rank,
                    type: t.type
                } as ITask
            })
        }

        return {
            title: temp.title,
            tasks: tasks,
            comments: [],
            status: 'AWAITING',
            waive_module: temp.waive_module,
        }
    }

    public override makeRouter() {
        let r = super.makeRouter()
        // Builds a project matching the passed project template ID
        r.get('/instance/:id', async (ctx, next) => {
            if (!this.exists(ctx.params.id)) {
                ctx.body = this.buildModuleFromId(ctx.params.id)
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

export const ModuleTemplateRouteInstance = new ModuleTemplateRoute()