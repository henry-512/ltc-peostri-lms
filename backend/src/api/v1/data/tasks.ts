import { ArangoWrapper } from '../../../database'
import { IFilemeta, ITask } from '../../../lms/types'
import { getFile } from '../../../lms/util'
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

    /**
     * COMPLETE
     */
    public async complete(user: AuthUser, taskId: string) {
        await this.db.updateFaster([taskId], 'status', 'COMPLETE')
    }

    /**
     * UPLOAD
     */
    public async upload(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let fileData = getFile(files, fileKey)
        let latest = await FiledataManager.writeFile(user, fileData)
        if (!latest.id) {
            throw this.internal('upload', `file ${latest} lacks .id field`)
        }
        let fileId = latest.id
        await FiledataManager.db.save(latest)

        // Redundant, taskId is assumed to be valid
        // await this.db.assertIdExists(taskId)

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

        if (mod.files) {
            let filemeta = await FilemetaManager.db.get(mod.files as string)

            filemeta.old = (<string[]>filemeta.old).concat(
                <string>filemeta.latest
            )
            filemeta.latest = fileId

            // Update filemeta
            await FilemetaManager.db.update(filemeta, { mergeObjects: false })
        } else {
            // Build a new filemeta object
            filemeta = {
                id: FilemetaManager.db.generateDBID(),
                latest: fileId,
                reviews: [],
                old: [],
                oldReviews: [],
                module: task.module,
            }

            mod.files = filemeta.id
            // Update filemeta
            await FilemetaManager.db.save(filemeta)
            await ModuleManager.db.update(mod, { mergeObjects: false })
        }

        // Update task
        await this.db.updateFaster([taskId], 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * Review
     */
    public async review(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {}
}

export const TaskManager = new Task()
