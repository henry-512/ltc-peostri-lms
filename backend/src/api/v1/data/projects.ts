import { HTTPStatus } from '../../../lms/errors'
import {
    compressStepper,
    IStepper,
    stepperForEachInOrder,
} from '../../../lms/Stepper'
import { IModule, IProject, ITask } from '../../../lms/types'
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

        // Master list of all users for the project
        // let allUsers = p.users as string[]
        // let rankCursor = await UserManager.db.getWithIdFaster<string>(
        //     allUsers,
        //     'rank'
        // )
        // let userRankMap = new Map<string, string>()
        // rankCursor.forEach((val) => {
        //     // userRankMap.set()
        // })

        // Start date of the project
        let startDate = new Date(p.start)
        let incrementedTTC = 0

        let moduleIdStepper = p.modules as IStepper<string>
        // All modules we need to process
        let mappedMods: IModule[] = map.get(ModuleManager) ?? []
        let mappedTasks: ITask[] = map.get(TaskManager) ?? []

        // Step over the modules
        await stepperForEachInOrder<string>(
            moduleIdStepper,
            async (modStepNum, arrayOfModuleIds) => {
                // Build modules
                let modules: IModule[] = await Promise.all(
                    arrayOfModuleIds.map(async (id) => {
                        let modKey = ModuleManager.db.asKey(id)
                        for (const m of mappedMods) {
                            if (m.id === modKey) {
                                return m
                            }
                        }
                        if (await ModuleManager.db.exists(id)) {
                            let mod = await ModuleManager.db.get(id)
                            mappedMods.push(mod)
                            return mod
                        } else {
                            console.warn(
                                `Module id ${id} does not exist in ${JSON.stringify(
                                    mappedMods
                                )} or in the database`
                            )
                            return undefined as any
                        }
                    })
                )

                let maxModTTC = 0

                // Iterate over all modules
                for (const mod of modules) {
                    if (!mod) continue

                    let totalModuleTTC = 0
                    await stepperForEachInOrder<string>(
                        mod.tasks as IStepper<string>,
                        async (taskStepNum, arrayOfTaskIds) => {
                            // Build tasks
                            let tasks: ITask[] = await Promise.all(
                                arrayOfTaskIds.map(async (id) => {
                                    let taskKey = TaskManager.db.asKey(id)
                                    for (const t of mappedTasks) {
                                        if (t.id === taskKey) {
                                            return t
                                        }
                                    }
                                    if (await TaskManager.db.exists(id)) {
                                        let task = await TaskManager.db.get(id)
                                        mappedTasks.push(task)
                                        return task
                                    } else {
                                        console.warn(
                                            `Task id ${id} does not exist in ${JSON.stringify(
                                                mappedTasks
                                            )} or in the database`
                                        )
                                        return undefined as any
                                    }
                                })
                            )

                            let maxTaskTime = 0

                            // For each task array
                            for (const task of tasks) {
                                if (!task) continue

                                let ttc = task.ttc ?? 0
                                task.suspense = addDays(
                                    startDate,
                                    incrementedTTC + ttc
                                ).toJSON()
                                task.project = this.db.asId(doc.id ?? '')

                                if (ttc > maxTaskTime) {
                                    maxTaskTime = ttc
                                }
                            }

                            totalModuleTTC += maxTaskTime
                            incrementedTTC += maxTaskTime
                        }
                    )
                    // Set module suspense and ttc
                    mod.ttc = totalModuleTTC
                    mod.suspense = addDays(
                        startDate,
                        incrementedTTC + totalModuleTTC
                    ).toJSON()

                    // Update longest moudle
                    if (totalModuleTTC > maxModTTC) {
                        maxModTTC = totalModuleTTC
                    }
                }

                // Increment project ttc
                // totalProjectTTC += maxModTTC
                incrementedTTC += maxModTTC
            }
        )

        // Set project ttc and suspense
        p.ttc = incrementedTTC
        p.suspense = addDays(startDate, incrementedTTC)

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
            'tasks'
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
