import { ArangoWrapper } from '../../../database'
import { ITask } from '../../../lms/types'
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
        task: string,
        files: any,
        fileKey: string
    ) {
        let filemeta = await (
            await ArangoWrapper.getFilemetaFromTask(task)
        ).next()

        let fileData: IFileData = files[fileKey] as IFileData
        let latest = await FiledataManager.writeFile(user, fileData)
        let modId = await (
            await this.db.getFaster<string>([task], 'd.module')
        ).next()

        if (!modId) {
            throw this.internal(
                'upload',
                `Task ${task} could not find its parent`
            )
        }

        if (filemeta) {
            filemeta.old = (<string[]>filemeta.old).concat(
                <string>filemeta.latest
            )
            filemeta.latest = latest
            filemeta.id = filemeta._id
        } else {
            // Build a new filemeta object
            filemeta = {
                id: FiledataManager.db.generateDBID(),
                latest,
                reviews: [],
                old: [],
                oldReviews: [],
                module: modId,
            }
        }

        // Update filemeta
        await FilemetaManager.db.update(filemeta, { mergeObjects: false })
        // Update task
        await this.db.updateFaster([task], 'status', 'COMPLETED')
        await ModuleManager.automaticAdvance(user, modId)
    }
}

export const TaskManager = new Task()
