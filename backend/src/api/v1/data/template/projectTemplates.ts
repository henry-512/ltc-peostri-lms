import { IModule, IProject, IProjectTemplate } from "../../../../lms/types";
import { ModuleTemplateRouteInstance } from "./moduleTemplates";
import { isDBId } from "../../../../lms/util";
import { HTTPStatus } from "../../../../lms/errors";
import { DBManager } from "../../DBManager";

class ProjectTemplateRoute extends DBManager<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            // 'template/projects',
            'Project Template',
            {
                'title': { type: 'string' },
                'description': { type: 'string' },
                'modules': {
                    type: 'fkeyStep',
                    foreignApi: ModuleTemplateRouteInstance,
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

    public async buildProjectFromId(id:string) {
        let template = await this.db.get(id)
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
}

export const ProjectTemplateRouteInstance = new ProjectTemplateRoute()
