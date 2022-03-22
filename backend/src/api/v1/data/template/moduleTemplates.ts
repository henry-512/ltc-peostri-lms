import { HTTPStatus } from "../../../../lms/errors";
import { IModule, IModuleTemplate, ITask } from "../../../../lms/types";
import { DBManager } from "../../DBManager";

class ModuleTemplateRoute extends DBManager<IModuleTemplate> {
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
                'ttc': {
                    type: 'number',
                    optional:true,
                    default:0,
                },
            },
            false,
        )
    }

    public async buildModuleFromId(id:string): Promise<IModule> {
        let template = await this.db.get(id)
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
}

export const ModuleTemplateRouteInstance = new ModuleTemplateRoute()