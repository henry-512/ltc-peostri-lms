import {
    IModule,
    IModuleTemplate,
    ITask,
    ITaskTemplate,
} from '../../../../lms/types'
import { IStepper } from '../../../../lms/util'
import { AuthUser } from '../../../auth'
import { DataManager } from '../../DataManager'
import { DBManager } from '../../DBManager'
import { RankManager } from '../ranks'

class TaskTemplate extends DataManager<ITaskTemplate> {
    constructor() {
        super(
            'Task Template',
            {
                title: { type: 'string' },
                rank: {
                    type: 'fkey',
                    foreignApi: RankManager,
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
            { hasCUTimestamp: true }
        )
    }

    // Tasks have ids appended as part of the frontend process
    // These are completely useless in the db, and should be removed
    protected override rebuildDoc(
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<ITaskTemplate> {
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
            'title',
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
                waive_module: {
                    type: 'boolean',
                    optional: true,
                },
                ttc: {
                    type: 'number',
                    optional: true,
                    default: 0,
                },
            },
            { hasCUTimestamp: true }
        )
    }

    // Calculate ttc value
    // protected override async rebuildDoc(
    //     user: AuthUser,
    //     files: any,
    //     doc: any
    // ): Promise<IModuleTemplate> {
        

    //     return doc
    // }

    public async buildModuleFromId(id: string): Promise<IModule> {
        let template = await this.db.get(id)
        return this.buildModuleFromTemplate(template, id)
    }

    private buildModuleFromTemplate(
        temp: IModuleTemplate,
        id: string
    ): IModule {
        let tasks: IStepper<ITask> = {}

        for (let [stepName, tempArray] of Object.entries(temp.tasks)) {
            tasks[stepName] = tempArray.map((t) => {
                return {
                    title: t.title,
                    status: t.status,
                    users: [],
                    rank: t.rank,
                    type: t.type,
                } as ITask
            })
        }

        return {
            id,
            title: temp.title,
            tasks: tasks,
            comments: [],
            status: 'AWAITING',
        }
    }
}

export const ModuleTempManager = new ModuleTemplate()
