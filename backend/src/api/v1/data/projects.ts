import { HTTPStatus } from '../../../lms/errors'
import { IModule, IProject, ITask } from '../../../lms/types'
import { IStepper } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { CommentManager } from './comments'
import { ModuleManager } from './modules'
import { UserManager } from './users'

function addDays(date: Date, days: number) {
    let d = new Date(date)
    d.setDate(d.getDate() + days)
    return d
}

class Project extends DBManager<IProject> {
    constructor() {
        super(
            'projects',
            'Project',
            'title',
            {
                title: { type: 'string' },
                start: { type: 'string' },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                comments: {
                    type: 'array',
                    instance: 'fkey',
                    default: [],
                    freeable: true,
                    acceptNewDoc: true,
                    foreignApi: CommentManager,
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                modules: {
                    type: 'step',
                    instance: 'fkey',
                    freeable: true,
                    acceptNewDoc: true,
                    foreignApi: ModuleManager,
                },
                users: {
                    type: 'array',
                    instance: 'fkey',
                    default: [],
                    getIdKeepAsRef: true,
                    foreignApi: UserManager,
                },
            },
            { hasCUTimestamp: true }
        )
    }

    protected override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IProject> {
        if (typeof doc.ttc !== 'number') {
            delete doc.ttc
            return doc
        }

        // Calculate start dates from TTC values
        let modules = doc.modules

        if (typeof modules !== 'object') {
            throw this.error(
                'modifyDoc',
                HTTPStatus.BAD_REQUEST,
                'Unexpected type',
                `${modules} is not a module step object`
            )
        }

        // Current offset (in days)
        let offset = 0
        let start = new Date(doc.start)

        // Current time to complete this project
        let maxModuleTTC = 0
        for (let modStepId in modules) {
            let modStep = modules[modStepId]

            if (!Array.isArray(modStep)) {
                throw this.error(
                    'modifyDoc',
                    HTTPStatus.BAD_REQUEST,
                    'Unexpected type',
                    `${modStep} is not a module array`
                )
            }

            for (let mod of modules) {
                if (typeof mod.ttc !== 'number') {
                    delete mod.ttc
                    continue
                }

                let tasks = mod.tasks
                if (typeof tasks !== 'object') {
                    throw this.error(
                        'modifyDoc',
                        HTTPStatus.BAD_REQUEST,
                        'Unexpected type',
                        `${tasks} is not a task step object`
                    )
                }

                // Total time to complete this module's tasks
                let taskTTC = this.getTaskTTCTotal(mod.tasks, start, offset)

                mod.suspense = addDays(start, offset + mod.ttc)

                delete mod.ttc
            }
        }
        maxModuleTTC += doc.ttc

        console.log(maxModuleTTC)

        delete doc.ttc
        return doc
    }

    // current maximum time to complete modules in this step
    public getModuleTTCMax(modules: IModule[], start: Date, offset: number) {
        let max = 0
        for (let mod of modules) {
            if (typeof mod.ttc !== 'number') {
                console.log(mod.ttc)
                delete mod.ttc
                continue
            }

            let taskTTC = this.getTaskTTCTotal(<any>mod.tasks, start, offset)
            max = Math.max(max, taskTTC + mod.ttc)
        }
        return max
    }

    public getTaskTTCTotal(
        tasks: IStepper<ITask>,
        start: Date,
        offset: number
    ) {
        let total = 0
        for (let taskStepId in tasks) {
            let taskStep = tasks[taskStepId]

            if (!Array.isArray(taskStep)) {
                throw this.error(
                    'modifyDoc',
                    HTTPStatus.BAD_REQUEST,
                    'Unexpected type',
                    `${taskStep} is not a task array`
                )
            }

            // The weight of the task array is the longest element
            // Appending total 
            total += this.getTaskTTCMax(taskStep, start, total + offset)
        }
        return total
    }

    // Current maximum time to complete the tasks in this step
    public getTaskTTCMax(tasks: ITask[], start: Date, offset: number) {
        let max = 0
        for (let task of tasks) {
            if (typeof task.ttc !== 'number') {
                console.log(task.ttc)
                delete task.ttc
                continue
            }

            max = Math.max(max, task.ttc)
            task.suspense = addDays(start, offset + task.ttc)

            delete task.ttc
        }

        return max
    }
}

export const ProjectManager = new Project()
