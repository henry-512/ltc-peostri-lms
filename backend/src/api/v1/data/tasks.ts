import { ArangoWrapper } from '../../../database'
import { HTTPStatus } from '../../../lms/errors'
import { getStep } from '../../../lms/Stepper'
import { IFilemeta, IModule, ITask } from '../../../lms/types'
import { getFile, tryGetFile } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FilemetaManager, IFileData } from './filemeta'
import { FiledataManager } from './files'
import { ModuleManager } from './modules'
import { ProjectManager } from './projects'

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

    private async checkFileTaskModule(
        taskId: string,
        files: any,
        fileKey: string
    ) {
        // Verify file exists
        let fileData = getFile(files, fileKey)

        return { fileData, ...(await this.checkTaskAndModule(taskId)) }
    }

    private async checkTaskAndModule(taskId: string) {
        // Retrieve task
        let task = await this.db.get(taskId)
        if (!task.module) {
            throw this.internal(
                'upload',
                `Task ${taskId} could not find its parent`
            )
        }

        // Retrieve module
        await ModuleManager.db.assertIdExists(task.module)
        let mod = await ModuleManager.db.get(task.module)

        return { modId: task.module, mod }
    }

    private async saveFile(user: AuthUser, fileData: IFileData) {
        // Save file
        let review = await FiledataManager.writeFile(user, fileData)
        if (!review.id) {
            throw this.internal('upload', `file ${review} lacks .id field`)
        }
        // Necessary to cache this value here, db.save clears it
        let fileId = review.id
        await FiledataManager.db.save(review)

        return fileId
    }

    /**
     * COMPLETE
     */
    public async complete(user: AuthUser, taskId: string) {
        await this.db.updateOneFaster(taskId, 'status', 'COMPLETE')
        let modId = await this.db.getOneFaster<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
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
        // Check/retrieve data
        let { mod, modId, fileData } = await this.checkFileTaskModule(
            taskId,
            files,
            fileKey
        )

        // Save file
        let fileId = await this.saveFile(user, fileData)

        // Build/modify filemeta
        let filemeta: IFilemeta
        if (mod.files) {
            let filemeta = await FilemetaManager.db.get(mod.files as string)

            FilemetaManager.pushLatest(filemeta, fileId)

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
                module: modId,
            }

            mod.files = filemeta.id
            // Update filemeta
            await FilemetaManager.db.save(filemeta)
            await ModuleManager.db.update(mod, { mergeObjects: false })
        }

        // Check if this is the DOCUMENT_REVISE task
        let status = await this.db.getOneFaster<string>(taskId, 'type')
        if (status === 'DOCUMENT_REVISE') {
            // Set all reviewers to IN_PROGRESS
            // Notify status
            await this.db.updateWithFilterFaster(
                'type',
                'DOCUMENT_REVIEW',
                'status',
                'IN_PROGRESS'
            )
        }

        // Update task and ADVANCE
        await this.db.updateOneFaster(taskId, 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * REVIEW
     */
    public async review(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let { mod, modId } = await this.checkTaskAndModule(taskId)
        let fileData = tryGetFile(files, fileKey)

        if (fileData) {
            // File is uploaded, update mod.files
            // If files dont exist, we can't proceed
            if (!mod.files) {
                // Throw an error, we need to upload a file first
                throw this.error(
                    'review',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid module state.',
                    `${JSON.stringify(mod)} lacks filemeta object`
                )
            }

            // Save file
            let fileId = await this.saveFile(user, fileData)

            // Get filemeta
            let filemeta = await FilemetaManager.db.get(mod.files as string)
            // Modify filemeta
            filemeta.reviews = (<string[]>filemeta.reviews).concat(fileId)
            // Update filemeta
            await FilemetaManager.db.update(filemeta, { mergeObjects: false })
            // Task should remain unchanged. Module cannot advance from this
            // state

            // Rip current step
            let currentStep = getStep<string>(mod.tasks, mod.currentStep)

            // Find revise task
            let reviseTaskCursor = await this.db.filterIdsFaster(
                currentStep,
                'type',
                'DOCUMENT_REVISE'
            )

            // Check if we already have a revise task
            if (reviseTaskCursor.hasNext) {
                // A revise task already exists here, set it back to IN_PROGRESS
                let id: string = await reviseTaskCursor.next()
                await this.db.updateOneFaster(id, 'status', 'IN_PROGRESS')
            } else {
                // No existing revise task

                //
                let id = this.db.generateDBID()

                // Pull users from the project
                let users = await ProjectManager.db.getOneFaster<string[]>(
                    mod.project as string,
                    'users'
                )

                // TODO: Rip user/rank from existing upload task
                let task: ITask = {
                    id,
                    users,
                    title: 'AUTO - Revise Documents',
                    status: 'IN_PROGRESS',
                    type: 'DOCUMENT_REVISE',
                    module: modId,
                    project: mod.project,
                }

                // Save new task
                await this.db.save(task)

                // Updates the reference of currentStep (which is a mutable part of the stepper mod.tasks)
                currentStep.push(id)
                // Update the task stepper of module with the new task, which works because the above modified the stepper
                await ModuleManager.db.updateOneFaster(
                    modId,
                    'tasks',
                    mod.tasks
                )
            }
        } else {
            // If no file is provided, the current file is acceptable
            // Update task and ADVANCE
            await this.db.updateOneFaster(taskId, 'status', 'COMPLETED')
            await ModuleManager.postAutomaticAdvance(user, mod)
        }
    }

    /**
     * REVISE
     */
    public async revise(user: AuthUser, taskId: string, reviseFileKey: string) {
        let { mod, modId } = await this.checkTaskAndModule(taskId)

        // If files dont exist, we can't proceed
        if (!mod.files) {
            // Throw an error, we need to upload a file first
            throw this.error(
                'review',
                HTTPStatus.BAD_REQUEST,
                'Invalid module state.',
                `${JSON.stringify(mod)} lacks filemeta object`
            )
        }

        // Get filemeta
        let filemeta = await FilemetaManager.db.get(mod.files as string)

        // Cache revise file
        let reviseFileId = FiledataManager.db.asId(reviseFileKey)

        // Locate revised file
        let found = false
        for (let i = 0; i < filemeta.reviews.length; i++) {
            let r = filemeta.reviews[i]
            if (r === reviseFileId) {
                // Remove from reviews
                filemeta.reviews.splice(i, 1)
                // Push into oldReviews
                filemeta.oldReviews = (<string[]>filemeta.oldReviews).concat(r)
                found = true
                break
            }
        }
        if (!found) {
            throw this.error(
                'revise',
                HTTPStatus.BAD_REQUEST,
                'Invalid revise key',
                `${reviseFileKey} -> ${reviseFileId} not a valid fieldata key`
            )
        }

        // Update filemeta
        await FilemetaManager.db.update(filemeta, { mergeObjects: false })

        // Update this task
        await this.db.updateOneFaster(taskId, 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * APPROVE
     */
    public async approve(user: AuthUser, taskId: string) {
        await this.db.updateOneFaster(taskId, 'status', 'COMPLETED')
        // ADVANCE
        let modId = await this.db.getOneFaster<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
    }

    /**
     * DENY
     */
    public async deny(user: AuthUser, taskId: string) {
        // RESTART
        let modId = await this.db.getOneFaster<string>(taskId, 'module')
        await ModuleManager.restart(user, modId, false)
    }
}

export const TaskManager = new Task()
