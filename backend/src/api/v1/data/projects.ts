import { HTTPStatus } from '../../../lms/errors'
import { IModule, IProject, ITask } from '../../../lms/types'
import {
    buildStepperKey,
    compressStepper,
    IStepper,
    stepperForEachInOrder,
} from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { ModuleManager } from './modules'
import { NotificationManager } from './notifications'
import { TaskManager } from './tasks'

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
                    managerName: 'modules',
                    freeable: true,
                    acceptNewDoc: true,
                },
                users: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'users',
                    default: [],
                    getIdKeepAsRef: true,
                },
                team: {
                    type: 'fkey',
                    managerName: 'teams',
                    optional: true,
                    getIdKeepAsRef: true,
                },
                ttc: {
                    type: 'number',
                    optional: true,
                },
                currentStep: {
                    type: 'number',
                    default: 0,
                },
            },
            { hasUpdate: true, hasCreate: true, defaultFilter: 'title' }
        )
    }

    // Update TTC and set users
    public override async verifyAddedDocument(
        user: AuthUser,
        files: any,
        doc: IProject,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        lastDBId: string
    ): Promise<IProject> {
        let p = await super.verifyAddedDocument(
            user,
            files,
            doc,
            exists,
            map,
            lastDBId
        )

        if (0 === 0) return p

        // Start date of the project
        let startDate = new Date(p.start)
        let incrementedTTC = 0

        let moduleIdStepper = p.modules as IStepper<string>
        // All modules we need to process
        let mappedMods: IModule[] = map.get(ModuleManager) ?? []

        // Step over the modules
        await stepperForEachInOrder(moduleIdStepper, async (modStepNum) => {
            let k = buildStepperKey(modStepNum)
            let arrayOfModuleIds = moduleIdStepper[k]

            // Build modules
            let modules: IModule[] = await Promise.all(
                arrayOfModuleIds.map(async (id) => {
                    let modKey = ModuleManager.db.asKey(id)
                    for (const m of mappedMods) {
                        if (m.id === modKey) {
                            return m
                        }
                    }
                    let mod = await ModuleManager.db.get(id)
                    mappedMods.push(mod)
                    return mod
                })
            )

            let maxModTTC = 0

            // Iterate over all modules
            for (const mod of modules) {
                await stepperForEachInOrder(mod.tasks, async (taskStepNum) => {
                    let k = buildStepperKey(taskStepNum)
                    let arrayOfTaskIds = mod.tasks

                    // Build tasks
                    // let tasks: ITask[] = await Promise.all(
                    //     // arrayOfTaskIds.map(async (id) => {

                    //     // })
                    // )
                })

                let tasks = compressStepper<string>(mod.tasks)

                let taskTTCCursor = await TaskManager.db.getFaster<number>(
                    tasks,
                    'ttc'
                )
                let ttc = 0
                await taskTTCCursor.forEach((v) => {
                    ttc += v
                })

                mod.ttc = ttc
                incrementedTTC += ttc
                // mod.suspense = addDays(startDate, incrementedTTC + maxTaskTTC)
            }

            incrementedTTC += maxModTTC
        })

        // Set project ttc and suspense
        p.ttc = incrementedTTC
        p.suspense = startDate.toJSON()

        return p
    }

    public override async create(
        user: AuthUser,
        files: any,
        d: IProject,
        real: boolean
    ): Promise<string> {
        let id = await super.create(user, files, d, real)

        await NotificationManager.buildAndSaveNotification(
            user.id,
            `Project ${id} created.`,
            {
                display: d.title,
                resource: 'projects',
                id: this.db.asKey(id),
            }
        )

        return id
    }

    public override async update(
        user: AuthUser,
        files: any,
        id: string,
        doc: IProject,
        real: boolean
    ): Promise<void> {
        await super.update(user, files, id, doc, real)

        await NotificationManager.buildAndSaveNotification(
            user.id,
            `Project ${id} updated.`,
            {
                display: doc.title,
                resource: 'projects',
                id: this.db.asKey(id),
            }
        )
    }

    // protected override modifyDoc = (
    //     user: AuthUser,
    //     files: any,
    //     doc: any
    // ): Promise<IProject> => {
    //     // Calculate start dates from TTC values
    //     let modules = doc.modules

    //     if (typeof modules !== 'object') {
    //         throw this.error(
    //             'modifyDoc',
    //             HTTPStatus.BAD_REQUEST,
    //             'Unexpected type',
    //             `${modules} is not a module step object`
    //         )
    //     }

    //     // Start date of the project
    //     let start = new Date(doc.start)

    //     // Calculate total time for all modules
    //     let total = this.getModuleTTCTotal(modules, start, 0)

    //     // Calculate suspense date
    //     doc.suspense = addDays(start, total).toJSON()
    //     // doc.suspense = addDays(start, total + doc.ttc).toJSON()

    //     // set TTC
    //     doc.ttc = total

    //     return doc
    // }

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

    //
    // PROCEEDING
    //

    public async complete(user: AuthUser, id: string, force: boolean) {
        let pro = await this.db.get(id)
        return this.postComplete(user, pro, force)
    }

    public async postComplete(user: AuthUser, pro: IProject, force: boolean) {
        pro.status = 'COMPLETED'
        // Retrieve all modules
        let allModules = compressStepper<string>(pro.modules)
        // Retrieve all tasks
        let cursor = await this.db.getFaster<IStepper<string>>(
            allModules,
            'd.tasks'
        )
        let allTasks: string[] = []
        while (cursor.hasNext) {
            let taskStepper = await cursor.next()
            if (!taskStepper) break
            let taskIds = compressStepper<string>(taskStepper)
            allTasks = allTasks.concat(taskIds)
        }

        // Verify all modules/tasks are completed, if required
        if (!force) {
            // Verify all modules are completed
            let invalidModules = await ModuleManager.db.assertOrEqualsFaster(
                allModules,
                'status',
                ['COMPLETED', 'WAIVED']
            )
            if (invalidModules.hasNext) {
                let all = await invalidModules.all()
                throw this.error(
                    'postComplete',
                    HTTPStatus.BAD_REQUEST,
                    `A Module is uncompleted.`,
                    `Project ${JSON.stringify(
                        pro
                    )} cannot be completed due to incomplete module(s) ${JSON.stringify(
                        all
                    )}`
                )
            }
            // Verify all tasks are completed
            let invalidTasks = await TaskManager.db.assertEqualsFaster(
                allTasks,
                'status',
                'COMPLETED'
            )
            if (invalidTasks.hasNext) {
                let all = await invalidTasks.all()
                throw this.error(
                    'postComplete',
                    HTTPStatus.BAD_REQUEST,
                    `A Module is uncompleted.`,
                    `Project ${JSON.stringify(
                        pro
                    )} cannot be completed due to incomplete tasks(s) ${JSON.stringify(
                        all
                    )}`
                )
            }
        } else {
            // Mark all modules and their tasks as COMPLETED
            // BUG: Modules with files are not set to WAIVED
            await ModuleManager.db.updateFaster(
                allModules,
                'status',
                'COMPLETED'
            )
            await TaskManager.db.updateFaster(allTasks, 'status', 'COMPLETED')
        }

        // Update project
        await this.db.update(pro, { mergeObjects: false })
        return pro
    }
}

export const ProjectManager = new Project()
