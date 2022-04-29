import { HTTPStatus } from '../../../lms/errors'
import {
    compressStepper,
    getStep,
    IStepper,
    stepperForEachInOrder,
} from '../../../lms/Stepper'
import { IModule, IProject, ITask } from '../../../lms/types'
import { addDays, concatOrSetMapArray } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { ModuleManager } from './modules'
import { TaskManager } from './tasks'
import { UserManager } from './users'

/**
 * Projects. Denote an entire process workflow, from start to finish.
 */
export class Project extends DBManager<IProject> {
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
                    default: {},
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
                // True if we should automatically assign users
                auto_assign: {
                    type: 'boolean',
                    default: false,
                },
                // Automatically calculated
                percent_complete: {
                    type: 'number',
                    optional: true,
                },
            },
            { hasUpdate: true, hasCreate: true, defaultFilter: 'title' }
        )
    }

    // Update TTC and set users
    public override async prepareDocumentForUpload(
        user: AuthUser,
        files: any,
        doc: IProject,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        lastDBId: string
    ): Promise<IProject> {
        let p = await super.prepareDocumentForUpload(
            user,
            files,
            doc,
            exists,
            map,
            lastDBId
        )

        let pid = this.db.asId(p.id as string)

        // Master list of all users for the project
        let allUsers = p.users as string[]
        let rankCursor = await UserManager.db.getManyFieldWithId<string>(
            allUsers,
            'rank'
        )
        let userRankMap = new Map<string, string[]>()
        // Convert {user,rank}[] pairs to a rank:user[] map
        await rankCursor.forEach((val) =>
            concatOrSetMapArray<string, string>(userRankMap, val.v, val.id)
        )

        // Calculate %-complete
        let totalModules = 0
        let completeModules = 0

        // Start date of the project
        let startDate = new Date(p.start)
        let projectIncrementedTTC = 0

        let moduleIdStepper = p.modules as IStepper<string>
        // All modules we need to process
        let mappedMods: IModule[] = map.get(ModuleManager) ?? []
        let mappedTasks: ITask[] = map.get(TaskManager) ?? []

        //
        // This next section loops over every task and every module to calculate
        // the percent complete and calculate all of the TTC values. Notably,
        // this runs after already performing this operation as part of the
        // upload preparation stage.
        //

        // Step over the modules
        await stepperForEachInOrder<string>(
            moduleIdStepper,
            async (modStepNum, arrayOfModuleIds) => {
                // Build modules
                let modules: IModule[] = await Promise.all(
                    arrayOfModuleIds.map(async (id) => {
                        for (const m of mappedMods) {
                            if (m.id === id) {
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

                    totalModules++
                    if (mod.status === 'COMPLETED' || mod.status === 'WAIVED') {
                        completeModules++
                    }

                    let totalTasks = 0
                    let completeTasks = 0
                    let moduleIncrementedTTC = 0

                    let totalModuleTTC = 0
                    await stepperForEachInOrder<string>(
                        mod.tasks as IStepper<string>,
                        async (taskStepNum, arrayOfTaskIds) => {
                            // Build tasks
                            let tasks: ITask[] = await Promise.all(
                                arrayOfTaskIds.map(async (id) => {
                                    for (const t of mappedTasks) {
                                        if (t.id === id) {
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

                                // Increment task counts
                                totalTasks++
                                if (task.status === 'COMPLETED') {
                                    completeTasks++
                                }

                                let ttc = task.ttc ?? 0

                                // Set suspense date
                                task.suspense = addDays(
                                    startDate,
                                    projectIncrementedTTC +
                                        moduleIncrementedTTC +
                                        ttc
                                ).toJSON()
                                // Attach project
                                task.project = this.db.asId(doc.id ?? '')
                                // Auto-Assign users
                                if (doc.auto_assign === true && task.rank) {
                                    let usersByRank = userRankMap.get(task.rank)

                                    if (usersByRank) {
                                        // ES6 comprehension
                                        let merged = [
                                            ...new Set([
                                                ...(task.users as string[]),
                                                ...usersByRank,
                                            ]),
                                        ]
                                        task.users = merged
                                    }
                                }

                                if (ttc > maxTaskTime) {
                                    maxTaskTime = ttc
                                }
                            }

                            totalModuleTTC += maxTaskTime
                            moduleIncrementedTTC += maxTaskTime
                        }
                    )
                    // Set module suspense and ttc
                    mod.ttc = totalModuleTTC
                    mod.suspense = addDays(
                        startDate,
                        projectIncrementedTTC + totalModuleTTC
                    ).toJSON()

                    // Set module %-complete
                    mod.percent_complete = (100 * completeTasks) / totalTasks

                    // Update longest moudle
                    if (totalModuleTTC > maxModTTC) {
                        maxModTTC = totalModuleTTC
                    }
                }

                // Increment project ttc
                // totalProjectTTC += maxModTTC
                projectIncrementedTTC += maxModTTC
            }
        )

        // Set project ttc and suspense
        p.ttc = projectIncrementedTTC
        p.suspense = addDays(startDate, projectIncrementedTTC)

        // Set project %-complete
        p.percent_complete = (100 * completeModules) / totalModules

        //
        // Delete removed modules and tasks
        //
        if (exists) {
            let currentModules = compressStepper<string>(
                await this.db.getOneField<IStepper<string>>(pid, 'modules')
            )
            let newModuleSet = new Set(compressStepper<string>(moduleIdStepper))

            /** Modules that need to be deleted */
            let oldModules = currentModules.filter((m) => !newModuleSet.has(m))
            // Delete removed modules
            for (const mId of oldModules) {
                await ModuleManager.delete(user, mId)
            }

            // Delete removed tasks
            /** Modules that already exist in the database */
            let existingModules = currentModules.filter(
                (t) => newModuleSet.has(t) && ModuleManager.db.exists(t)
            )

            /** Tasks that are already in the database */
            let currentTasks = await (
                await ModuleManager.db.getManyField<IStepper<string>>(
                    existingModules,
                    'tasks'
                )
            ).flatMap((s) => compressStepper<string>(s))
            // Set of all task IDs
            let allTaskIds = new Set(
                mappedTasks.map((t) => TaskManager.db.asId(t.id as string))
            )

            let oldTasks = currentTasks.filter((t) => !allTaskIds.has(t))
            for (const tId of oldTasks) {
                await TaskManager.delete(user, tId)
            }
        }

        return p
    }

    // Updates project status
    public override async create(
        user: AuthUser,
        files: any,
        d: IProject
    ): Promise<string> {
        let id = await super.create(user, files, d)

        // Update module statuses
        await this.updateStatus(user, id)

        return id
    }

    // Updates project status
    public override async update(
        user: AuthUser,
        files: any,
        id: string,
        doc: IProject
    ): Promise<void> {
        await super.update(user, files, id, doc)

        // Update module statuses
        await this.updateStatus(user, id)
    }

    //
    // PROCEEDING
    //

    /**
     * Calculates percent_complete based on the module status. Mutably modifies
     * `pro`. Can only read module keys.
     *
     * @param pro The project to calculate %-complete for.
     */
    private async calculatePercentComplete(pro: IProject) {
        let mods = compressStepper<string>(pro.modules)
        let comp = await ModuleManager.db.getAllNotEqual(mods, 'status', [
            'COMPLETED',
            'WAIVED',
        ])
        let compAll = await comp.all()
        pro.percent_complete =
            (100 * (mods.length - compAll.length)) / mods.length
    }

    /**
     * Automatically advances this project, if allowed. Called after a module advances.
     *
     * @param user The user for the request
     * @param id The project id to update
     */
    public async automaticAdvance(user: AuthUser, id: string) {
        let pro = await this.db.get(id)

        // Awaiting projects should be pushed to IN_PROGRESS
        if (pro.status === 'AWAITING') {
            pro.status = 'IN_PROGRESS'
        } else if (pro.status !== 'IN_PROGRESS') {
            // Only in-progress modules can be automatically advanced
            console.log(
                `Project ${id} attempted to advance, not IN_PROGRESS ${pro.status}`
            )
            return
        }

        // Current modules
        let currentStep = getStep<string>(pro.modules, pro.currentStep)

        if (!currentStep) {
            throw this.internal(
                'postAutomaticAdvance',
                `${JSON.stringify(
                    pro
                )} has invalid currentStep field ${currentStep}`
            )
        }

        // Verify module statuses
        let invalids = await ModuleManager.db.getAllNotEqual(
            currentStep,
            'status',
            ['COMPLETED', 'WAIVED']
        )

        // If there are modules remaining
        if (invalids.hasNext) {
            console.log(
                `project ${id} failed auto-advance from step #${
                    pro.currentStep
                }; modules ${await invalids.all()}`
            )
            return
        }

        // Increment step
        pro.currentStep++

        let nextStep = getStep<string>(pro.modules, pro.currentStep)

        if (nextStep) {
            // If there is a next step set those to IN_PROGRESS
            for (const modId of nextStep) {
                await ModuleManager.start(user, modId)
            }
        } else {
            // If we can't find the next step, the module is complete
            pro.status = 'COMPLETED'
            // Set current step to -1
            pro.currentStep = -1
        }

        // Calculate %-complete
        await this.calculatePercentComplete(pro)
        // Update the db
        await this.db.update(pro)
    }

    //
    // ROUTINES
    //

    /**
     * Restarts a project to base settings. Resets every module, purging all
     * files.
     *
     * @param user The user for the request
     * @param id The project to modify
     */
    public async restart(user: AuthUser, id: string) {
        let pro = await this.db.get(id)
        pro.status = 'AWAITING'
        pro.percent_complete = 0

        let modules = compressStepper<string>(pro.modules)

        for (const m of modules) {
            await ModuleManager.reset(user, m)
        }

        // Start project
        await this.postStartNextStep(user, pro)
    }

    /**
     * Starts a project. Only operates on AWAITING projects.
     *
     * @param user The user for the request.
     * @param id The project to modify
     */
    public async start(user: AuthUser, id: string) {
        let pro = await this.db.get(id)
        if (pro.status !== 'AWAITING') {
            throw this.error(
                'start',
                HTTPStatus.BAD_REQUEST,
                'Project is not AWAITING',
                `${pro} is not AWAITING`
            )
        }
        pro.percent_complete = 0
        return this.postStartNextStep(user, pro)
    }

    /**
     * Updates the project's currently active statuses. This includes starting
     * previously unstarted modules. Intended to be run after a project
     * create/update operation.
     *
     * @param user The user for the request
     * @param id The project to modify
     */
    public async updateStatus(user: AuthUser, id: string) {
        let pro = await this.db.get(id)

        // TODO: Start the project based on its start date
        if (pro.status === 'AWAITING') {
            await this.start(user, id)
            return
        } else if (pro.status !== 'IN_PROGRESS') {
            // Projects that are not IN_PROGRESS should not be updated
            return
        }

        // Update in-progress projects with new data

        let currentStep = getStep<string>(pro.modules, pro.currentStep ?? 0)

        let awaiting = await ModuleManager.db.filterField(
            currentStep,
            'status',
            'AWAITING'
        )

        // Start all awaiting modules on this step
        while (awaiting.hasNext) {
            let mid = (await awaiting.next()) as string
            await ModuleManager.start(user, mid)
        }
    }

    /**
     * Starts the next step in the project. Notifies all modules they should
     * start.
     *
     * @param user The user for the request
     * @param pro The project to update
     */
    private async postStartNextStep(user: AuthUser, pro: IProject) {
        // Calculate the next step. If not set, defaults to 0
        let nextStep = (pro.currentStep ?? -1) + 1

        // Awaiting projects should be started, not advanced
        if (pro.status === 'AWAITING') {
            pro.status = 'IN_PROGRESS'
            // Start from the first step
            nextStep = 0
        }

        let nextStepAr = getStep<string>(pro.modules, nextStep)

        // Next key not found, therefore this project is complete
        if (!nextStepAr) {
            await this.postComplete(user, pro, false)
            return
        }

        // Start the first step's modules
        for (let modId of nextStepAr) {
            await ModuleManager.start(user, modId)
        }
        // Update step
        pro.currentStep = nextStep

        // Calculate %-complete
        await this.calculatePercentComplete(pro)

        // Update in the db
        await this.db.update(pro)
    }

    /**
     * Forces a project as complete. Also forces all modules/tasks to complete.
     *
     * @param user The user for the request
     * @param id The project to modify
     */
    public async complete(user: AuthUser, id: string) {
        let pro = await this.db.get(id)
        await this.postComplete(user, pro, true)
    }

    /**
     * Marks a project as complete, and optionally validates that all processes
     * have been completed.
     *
     * @param user The user for the request
     * @param pro The project to modify
     * @param force If false, verify that all modules and tasks are complete
     */
    private async postComplete(user: AuthUser, pro: IProject, force: boolean) {
        pro.status = 'COMPLETED'
        // Retrieve all modules
        let allModules = compressStepper<string>(pro.modules)
        // Retrieve all tasks
        let cursor = await this.db.getManyField<IStepper<string>>(
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
            let invalidModules = await ModuleManager.db.getAllNotEqual(
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
            let invalidTasks = await TaskManager.db.getNotEqual(
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
            await ModuleManager.db.updateManyFaster(
                allModules,
                'status',
                'COMPLETED'
            )
            await TaskManager.db.updateManyFaster(
                allTasks,
                'status',
                'COMPLETED'
            )
        }

        // Set %-complete
        pro.percent_complete = 100

        // Update project
        await this.db.update(pro)
    }
}

export const ProjectManager = new Project()
