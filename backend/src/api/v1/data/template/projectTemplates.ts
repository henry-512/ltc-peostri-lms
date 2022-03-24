import { IModule, IProject, IProjectTemplate } from '../../../../lms/types'
import { isDBId, IStepper } from '../../../../lms/util'
import { DBManager } from '../../DBManager'
import { ModuleTempManager } from './moduleTemplates'

class ProjectTemplate extends DBManager<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            'Project Template',
            {
                title: { type: 'string' },
                modules: {
                    type: 'step',
                    instance: 'fkey',
                    foreignApi: ModuleTempManager,
                },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                ttc: {
                    type: 'number',
                    optional: true,
                    default: 0,
                },
            },
            {
                hasCUTimestamp: true,
            }
        )
    }

    public async buildProjectFromId(id: string) {
        let template = await this.db.get(id)
        return this.buildProjectFromTemplate(template, id)
    }

    private async buildProjectFromTemplate(
        temp: IProjectTemplate,
        id: string
    ): Promise<IProject> {
        let mods: IStepper<IModule> = {}

        for (let [stepName, tempArray] of Object.entries(temp.modules)) {
            mods[stepName] = await Promise.all(
                tempArray.map(async (i: any) => {
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
                })
            )
        }

        return {
            id,
            title: temp.title,
            start: new Date().toJSON(),
            end: new Date().toJSON(),
            status: temp.status,
            comments: [],
            modules: mods,
            users: [],
        }
    }
}

export const ProjectTempManager = new ProjectTemplate()
