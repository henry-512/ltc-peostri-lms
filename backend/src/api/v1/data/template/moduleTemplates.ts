import {
    IModule,
    IModuleTemplate,
    ITask,
    ITaskTemplate,
} from '../../../../lms/types'
import { convertToKey, IStepper } from '../../../../lms/util'
import { AuthUser } from '../../../auth'
import { DataManager } from '../../DataManager'
import { DBManager } from '../../DBManager'

class TaskTemplate extends DataManager<ITaskTemplate> {
    constructor() {
        super(
            'Task Template',
            {
                title: { type: 'string' },
                rank: {
                    type: 'fkey',
                    managerName: 'ranks',
                    // foreignApi: RankManager,
                    optional: true,
                },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                type: { type: 'string' },
                ttc: {
                    type: 'number',
                    optional: true,
                    default: 0,
                },
            },
            { hasCreate: true, hasUpdate: true }
        )
    }

    // Tasks have ids appended as part of the frontend process
    // These are completely useless in the db, and should be removed
    protected override modifyDoc = async (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<ITaskTemplate> => {
        delete doc.id

        return doc
    }
}

const TaskTempManager = new TaskTemplate()

class ModuleTemplate extends DBManager<IModuleTemplate> {
    constructor() {
        super(
            'moduleTemplates',
            'Module Template',
            {
                title: { type: 'string' },
                tasks: {
                    type: 'step',
                    instance: 'data',
                    foreignData: TaskTempManager,
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

    public async buildModuleFromId(id: string): Promise<IModule> {
        let template = await this.db.get(id)
        return this.buildModuleFromTemplate(template)
    }

    private buildModuleFromTemplate(temp: IModuleTemplate): IModule {
        let tasks: IStepper<ITask> = {}

        for (let [stepName, tempArray] of Object.entries(temp.tasks)) {
            tasks[stepName] = tempArray.map((t) => {
                return {
                    title: t.title,
                    status: t.status,
                    users: [],
                    rank: t.rank && convertToKey(t.rank),
                    type: t.type,
                    ttc: temp.ttc,
                } as ITask
            })
        }

        return {
            id: 'PraygeDeleteThis',
            title: temp.title,
            tasks: tasks,
            comments: [],
            status: 'AWAITING',
            ttc: temp.ttc,
            files: [],
            currentStep: 0,
        }
    }
}

export const ModuleTempManager = new ModuleTemplate()
