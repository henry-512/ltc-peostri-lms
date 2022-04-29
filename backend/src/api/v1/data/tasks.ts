import { APIError, HTTPStatus } from '../../../lms/errors'
import { getStep } from '../../../lms/Stepper'
import { IFileRevisions, ITask } from '../../../lms/types'
import { addDays, getFile, tryGetFile } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FilemetaManager, IFileData } from './filemeta'
import { FiledataManager } from './files'
import { ModuleManager } from './modules'
import { NotificationManager } from './notifications'
import { ProjectManager } from './projects'

/** Task Notification types */
export enum NotificationType {
    UPLOAD_AWAITING_REVIEW,
    AWAITING_REVIEW,
    TASK_AWAITING_ACTION,
}

/**
 * Builds a task notification content string from its notification type.
 *
 * @param t The type of notification
 * @param taskTitle The task's title
 * @param moduleTitle The module's title
 * @return A notification content string
 */
export function notificationContent(
    t: NotificationType,
    taskTitle: string,
    moduleTitle: string
): string {
    switch (t) {
        case NotificationType.AWAITING_REVIEW:
            return `A new document is awaiting your review for the "${moduleTitle}" module.`
        case NotificationType.UPLOAD_AWAITING_REVIEW:
            return `A commented document is awaiting your revisions for the "${moduleTitle}" module.`
        case NotificationType.TASK_AWAITING_ACTION:
            return `Task "${taskTitle}" is awaiting your action for the "${moduleTitle}" module.`
    }
    throw new APIError(
        'Task/notificationContent',
        'notificationContent',
        HTTPStatus.INTERNAL_SERVER_ERROR,
        'Internal Server Error',
        `${t} is not a valid NotificationType`
    )
}

const REVISE_TASK_TTC = 10

/**
 * Tasks. The smallest unit of work. Handles proceeding actions.
 */
export class Task extends DBManager<ITask> {
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
                    type: 'parent',
                    managerName: 'projects',
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
     * Sends a single notification to all users on the task.
     *
     * @param moduleTitle This task's module's title
     * @param moduleId This task's module id
     * @param taskId The task itself
     * @param content Either a pre-build string or a notification type to build
     * from
     */
    public async sendNotification(
        moduleTitle: string,
        moduleId: string,
        taskId: string,
        content: string | NotificationType
    ) {
        let moduleKey = ModuleManager.db.asKey(moduleId)
        let titleUser = await this.db.getOneFields<string, string[]>(
            taskId,
            'title',
            'users'
        )
        // Generate notification content based on notification type
        content =
            typeof content === 'string'
                ? content
                : notificationContent(content, titleUser.a, moduleTitle)
        await NotificationManager.sendToMultipleUsers(titleUser.b, content, {
            display: moduleTitle,
            id: moduleKey,
            resource: 'modules',
        })
    }

    /**
     * Sends a notification for each task passed and each user assigned to that
     * task. Note that all tasks must have the same parent module.
     *
     * @param moduleTitle This task's module's title
     * @param moduleId This task's module id
     * @param taskIds An array of tasks to send notifications for.
     * @param content Either a pre-build string or a notification type to build
     * from
     */
    public async sendManyNotifications(
        moduleTitle: string,
        moduleId: string,
        taskIds: string[],
        content: string | NotificationType
    ) {
        let moduleKey = ModuleManager.db.asKey(moduleId)
        // a = title, b = users
        let titleUser = await this.db.getManyFields<string, string[]>(
            taskIds,
            'title',
            'users'
        )
        while (titleUser.hasNext) {
            let next = await titleUser.next()
            if (!next) {
                return
            }
            // Generate notification content based on notification type
            content =
                typeof content === 'string'
                    ? content
                    : notificationContent(content, next.a, moduleTitle)
            await NotificationManager.sendToMultipleUsers(next.b, content, {
                display: moduleTitle,
                id: moduleKey,
                resource: 'modules',
            })
        }
    }

    /**
     * Runs pre-processing checks on the file and module data.
     *
     * @param taskId The task
     * @param files An files associated with this request
     * @param fileKey A key into `files` to retrieve a file for
     * @returns Parsed fields for later processing requests
     */
    private async checkFileTaskModule(
        taskId: string,
        files: any,
        fileKey: string
    ) {
        // Verify file exists
        let fileData = getFile(files, fileKey)
        return { fileData, ...(await this.checkTaskAndModule(taskId)) }
    }

    /**
     * Runs pre-processing checks on module data. Returns the raw module and its
     * `ID`.
     *
     * @param taskId The task
     * @returns The module's raw data and `ID`
     */
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

    /**
     * Saves a file to disk and database.
     *
     * @param user The user for the request
     * @param fileData The file data to write
     * @return A `Filedata` `ID` representing the file that was saved
     */
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
     * Forces this task as complete.
     *
     * @param user The user for the request
     * @param taskId The task to update
     */
    public async complete(user: AuthUser, taskId: string) {
        await this.db.updateFaster(taskId, 'status', 'COMPLETED')
        let modId = await this.db.getOneField<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
    }

    /**
     * Uploads task. Saves a file to disk and pushes `latest` into `old`.
     *
     * @param user The user for the request
     * @param taskId The task to update
     * @param files Any files associated with this request
     * @param fileKey A key into `files` with the file for this request
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
        let filemeta: IFileRevisions
        if (mod.files) {
            let filemeta = await FilemetaManager.db.get(mod.files as string)

            FilemetaManager.pushLatest(filemeta, fileId)

            // Update filemeta
            await FilemetaManager.db.update(filemeta)
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

            // Update module
            mod.files = filemeta.id
            await ModuleManager.db.updateFaster(modId, 'files', filemeta.id)
            // Update filemeta
            await FilemetaManager.db.save(filemeta)
        }

        // Check if this is the DOCUMENT_REVISE task
        let status = await this.db.getOneField<string>(taskId, 'type')
        if (status === 'DOCUMENT_REVISE') {
            // Set all reviewers to IN_PROGRESS
            // Notify status
            let updated = await this.db.updateFilterFaster(
                'type',
                'DOCUMENT_REVIEW',
                'status',
                'IN_PROGRESS'
            )
            // Send notifications
            if (updated.hasNext) {
                await this.sendManyNotifications(
                    mod.title,
                    modId,
                    await updated.all(),
                    NotificationType.UPLOAD_AWAITING_REVIEW
                )
            }
        }

        // Update task and ADVANCE
        await this.db.updateFaster(taskId, 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * Adds a file to the review "queue". Also generates the automatic REVISE
     * task (or restarts it) and attaches it to the module.
     *
     * @param user The user for the request
     * @param taskId The task to update
     * @param files Any files associated with this request
     * @param fileKey A key into `files` with the file for this request
     */
    public async review(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let { mod, modId, fileData } = await this.checkFileTaskModule(
            taskId,
            files,
            fileKey
        )

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
        await FilemetaManager.db.update(filemeta)

        // Rip current step
        let currentStep = getStep<string>(mod.tasks, mod.currentStep)

        // Find revise task
        let reviseTaskCursor = await this.db.filterField(
            currentStep,
            'type',
            'DOCUMENT_REVISE'
        )

        let reviseId: string

        // Check if we already have a revise task
        if (reviseTaskCursor.hasNext) {
            // A revise task already exists here, set it back to IN_PROGRESS
            reviseId = (await reviseTaskCursor.next()) as string
            await this.db.updateFaster(reviseId, 'status', 'IN_PROGRESS')
            // Send notification
            await this.sendNotification(
                mod.title,
                modId,
                reviseId,
                NotificationType.AWAITING_REVIEW
            )
        } else {
            // No existing revise task
            // Generate id for the task
            reviseId = this.db.generateDBID()

            // Pull users from the project
            let users = await ProjectManager.db.getOneField<string[]>(
                mod.project as string,
                'users'
            )

            // TODO: Rip user/rank from existing upload task
            let task: ITask = {
                id: reviseId,
                users,
                // rank: undefined,
                title: 'AUTO - Revise Documents',
                status: 'IN_PROGRESS',
                type: 'DOCUMENT_REVISE',
                module: modId,
                project: mod.project,
                // Should pull this from tasks in the step
                suspense: addDays(new Date(), REVISE_TASK_TTC).toJSON(),
                ttc: REVISE_TASK_TTC,
            }

            // Save new task
            await this.db.save(task)

            // Send notification
            // Updates the reference of currentStep (which is a mutable part of the stepper mod.tasks)
            currentStep.push(reviseId)
            // Update the task stepper of module with the new task, which works because the above modified the stepper
            await ModuleManager.db.updateFaster(modId, 'tasks', mod.tasks)
        }

        // Send notification
        await this.sendNotification(
            mod.title,
            modId,
            reviseId,
            NotificationType.AWAITING_REVIEW
        )

        // Update this task
        await this.db.updateFaster(taskId, 'status', 'COMPLETED')
        await ModuleManager.postAutomaticAdvance(user, mod)
    }

    /**
     * Marks a review file as read and moves it from `reviews` to `oldReviews`.
     * 
     * @param user The user for the request
     * @param taskId The task to update
     * @param reviseFileKey The review file to remove from the array
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
        await FilemetaManager.db.update(filemeta)
    }

    /**
     * Successfully completes an approve task and advances status.
     * 
     * @param user The user for the request
     * @param taskId The task to update
     */
    public async approve(user: AuthUser, taskId: string) {
        await this.db.updateFaster(taskId, 'status', 'COMPLETED')
        // ADVANCE
        let modId = await this.db.getOneField<string>(taskId, 'module')
        await ModuleManager.automaticAdvance(user, modId)
    }

    /**
     * Unsuccessfully completes (denies) an approve task. This soft-restarts the
     * module. Requires a file, which added to the review queue.
     *
     * @param user The user for the request
     * @param taskId The task to update
     * @param files Any files associated with this request
     * @param fileKey A key into `files` with the file for this request
     */
    public async deny(
        user: AuthUser,
        taskId: string,
        files: any,
        fileKey: string
    ) {
        let modId = await this.db.getOneField<string>(taskId, 'module')

        let fileData = tryGetFile(files, fileKey)
        if (fileData) {
            // Append file (optional) to reviews
            let fileMeta = await ModuleManager.db.getOneField<string>(
                modId,
                'files'
            )

            // If files dont exist, we can't proceed
            if (!fileMeta) {
                // Throw an error, we need to upload a file first
                throw this.error(
                    'review',
                    HTTPStatus.BAD_REQUEST,
                    'Invalid module state.',
                    `Module ${modId} lacks filemeta object`
                )
            }

            // Concat file to reviews

            // Save file
            let fileId = await this.saveFile(user, fileData)
            // Get filemeta
            let filemeta = await FilemetaManager.db.get(fileMeta)
            // Modify filemeta
            filemeta.reviews = (<string[]>filemeta.reviews).concat(fileId)
            // Update filemeta
            await FilemetaManager.db.update(filemeta)
        }

        // RESTART
        await ModuleManager.restart(user, modId)
    }
}

export const TaskManager = new Task()
