import { ArangoWrapper } from '../../../database'
import { IFilemeta, ITask } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FilemetaManager, IFileData } from './filemeta'
import { FiledataManager } from './files'
import { ModuleManager } from './modules'

class Task extends DBManager<ITask> {
    constructor() {
        super(
            'tasks',
            'Task',
            {
                title: { type: 'string' },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                users: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'users',
                    default: [],
                    getIdKeepAsRef: true,
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                rank: {
                    type: 'fkey',
                    managerName: 'ranks',
                    optional: true,
                    getIdKeepAsRef: true,
                },
                module: {
                    type: 'parent',
                    managerName: 'modules',
                    parentReferenceKey: 'tasks',
                },
                // Parent key for project
                project: {
                    type: 'string',
                    optional: true,
                },
                type: { type: 'string' },
                ttc: {
                    type: 'number',
                    optional: true,
                },
            },
            {
                defaultFilter: 'title',
            }
        )
    }

    public async upload(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let fileData: IFileData = files[fileKey] as IFileData
        let latest = await FiledataManager.writeFile(user, fileData)

        await this.db.assertIdExists(taskId)

        let task = await this.db.get(taskId)
        if (!task.module) {
            throw this.internal(
                'upload',
                `Task ${taskId} could not find its parent`
            )
        }

        await ModuleManager.db.assertIdExists(task.module)
        let mod = await ModuleManager.db.get(task.module)

        let filemeta: IFilemeta = {} as any

        if (mod.file) {
            let filemeta = await FilemetaManager.db.get(mod.file as string)

            filemeta.old = (<string[]>filemeta.old).concat(
                <string>filemeta.latest
            )
            filemeta.latest = latest

            // Update filemeta
            await FilemetaManager.db.update(filemeta, { mergeObjects: false })
        } else {
            // Build a new filemeta object
            filemeta = {
                id: FilemetaManager.db.generateDBID(),
                latest,
                reviews: [],
                old: [],
                oldReviews: [],
                module: task.module,
            }

            // Update filemeta
            await FilemetaManager.db.save(filemeta)
            mod.file = filemeta.id
            await ModuleManager.db.update(mod, { mergeObjects: false })
        }

        // Update task
        await this.db.updateFaster([taskId], 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }
}

export const TaskManager = new Task()
