import { IModule, IProject, IProjectTemplate } from "../../../../lms/types";
import { ModuleTempManager } from "./moduleTemplates";
import { isDBId } from "../../../../lms/util";
import { HTTPStatus } from "../../../../lms/errors";
import { DBManager } from "../../DBManager";

class ProjectTemplate extends DBManager<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            'Project Template',
            {
                'title': { type: 'string' },
                'modules': {
                    type: 'step',
                    instance: 'fkey',
                    foreignApi: ModuleTempManager,
                },
                'status': {
                    type: 'string',
                    default: 'AWAITING',
                },
                'ttc': {
                    type: 'number',
                    optional:true,
                    default:0,
                },
            },
            true,
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
                    throw this.internal(
                        'buildProjectFromTemplate',
                        `${i} is not a string`
                    )
                }
                if (!isDBId(i)) {
                    throw this.internal(
                        'buildProjectFromTemplate',
                        `${i} is not a valid db id`
                    )
                }
                return ModuleTempManager.buildModuleFromId(i)
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

export const ProjectTempManager = new ProjectTemplate()
