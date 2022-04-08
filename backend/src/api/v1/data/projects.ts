import { HTTPStatus } from '../../../lms/errors'
import { IModule, IProject, ITask } from '../../../lms/types'
import { IStepper } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { CommentManager } from './comments'
import { ModuleManager } from './modules'
import { TeamManager } from './teams'
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
            {
                title: { type: 'string' },
                start: { type: 'string' },
                status: {
                    type: 'string',
                    default: 'AWAITING',
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
                team: {
                    type: 'fkey',
                    foreignApi: TeamManager,
                    optional: true,
                },
                ttc: {
                    type: 'number',
                    optional: true,
                },
            },
            { hasUpdate: true, hasCreate: true, defaultFilter: 'title' }
        )
    }

    public async getProjectsAssignedToUser(id: string, q: any) {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'users',
            inArray: id,
        })

        let query = await this.db.queryGet(opts)

        let all = await query.cursor.all()

        await Promise.all(all.map(async (doc) => this.convertIDtoKEY(doc)))

        return {
            all,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + Math.min(query.size, opts.range.count),
        }
    }

    public async getNumProjectsAssignedToUser(id: string, q: any) {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'users',
            inArray: id,
        })

        return this.db.queryGetCount(opts)
    }

    protected override modifyDoc = (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IProject> => {
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

        // Start date of the project
        let start = new Date(doc.start)

        // Calculate total time for all modules
        let total = this.getModuleTTCTotal(modules, start, 0)

        // Calculate suspense date
        doc.suspense = addDays(start, total).toJSON()
        // doc.suspense = addDays(start, total + doc.ttc).toJSON()

        // set TTC
        doc.ttc = total

        return doc
    }

    public getModuleTTCTotal(
        modules: IStepper<IModule>,
        start: Date,
        offset: number
    ) {
        let total = 0
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

            // Add the maximum-length task for this module step
            total += this.getModuleTTCMax(modStep, start, total + offset)
        }
        return total
    }

    // current maximum time to complete modules in this step
    public getModuleTTCMax(modules: IModule[], start: Date, offset: number) {
        let max = 0
        for (let mod of modules) {
            if (typeof mod.tasks !== 'object') {
                throw this.error(
                    'modifyDoc',
                    HTTPStatus.BAD_REQUEST,
                    'Unexpected type',
                    `${mod.tasks} is not a task step object`
                )
            }

            // Total task time for this module
            let taskTTC = this.getTaskTTCTotal(<any>mod.tasks, start, offset)
            // max = Math.max(max, taskTTC + mod.ttc)
            max = Math.max(max, taskTTC)
            // Set suspense date
            mod.suspense = addDays(start, offset).toJSON()
            // mod.suspense = addDays(start, offset + mod.ttc).toJSON()
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
                task.ttc = 1
            }

            max = Math.max(max, task.ttc)
            task.suspense = addDays(start, offset + task.ttc).toJSON()
        }

        return max
    }
}

export const ProjectManager = new Project()
