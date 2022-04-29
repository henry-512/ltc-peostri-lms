import { IStepper } from '../../../../lms/Stepper'
import { IModule, IProject, IProjectTemplate } from '../../../../lms/types'
import { generateBase64UUID, isDBId } from '../../../../lms/util'
import { DBManager } from '../../DBManager'
import { ModuleTempManager } from './moduleTemplates'

export class ProjectTemplate extends DBManager<IProjectTemplate> {
    constructor() {
        super(
            'projectTemplates',
            'Project Template',
            {
                title: { type: 'string' },
                modules: {
                    type: 'step',
                    instance: 'fkey',
                    managerName: 'moduleTemplates',
                    acceptNewDoc: true,
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
            { hasCreate: true, hasUpdate: true, defaultFilter: 'title' }
        )
    }

    /**
     * Constructs a project from a project template `ID`.
     *
     * @param id The project template to create a project instance from
     */
    public async buildProjectFromId(id: string): Promise<IProject> {
        let temp = await this.db.get(id)
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
            id: generateBase64UUID(),
            title: temp.title,
            start: new Date().toJSON(),
            suspense: new Date().toJSON(),
            status: temp.status,
            modules: mods,
            users: [],
            ttc: temp.ttc,
            currentStep: 0,
            auto_assign: true,
        }
    }
}

export const ProjectTempManager = new ProjectTemplate()
