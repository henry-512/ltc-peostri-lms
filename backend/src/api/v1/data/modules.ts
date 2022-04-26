import { HTTPStatus } from '../../../lms/errors'
import { compressStepper, getStep } from '../../../lms/Stepper'
import { IFile, IFilemeta, IModule } from '../../../lms/types'
import { getUrl } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { FilemetaManager } from './filemeta'
import { ProjectManager } from './projects'
import { TaskManager } from './tasks'

class Module extends DBManager<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            {
                title: { type: 'string' },
                tasks: {
                    type: 'step',
                    instance: 'fkey',
                    managerName: 'tasks',
                    freeable: true,
                    acceptNewDoc: true,
                },
                comments: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'comments',
                    optional: true,
                    default: [],
                    freeable: true,
                    acceptNewDoc: true,
                },
                project: {
                    type: 'parent',
                    managerName: 'projects',
                    parentReferenceKey: 'modules',
                },
                status: {
                    type: 'string',
                    default: 'AWAITING',
                },
                suspense: {
                    type: 'string',
                    optional: true,
                },
                files: {
                    type: 'fkey',
                    managerName: 'filemeta',
                    optional: true,
                    acceptNewDoc: true,
                    userDefault: {
                        latest: '',
                        old: [],
                        reviews: [],
                        oldReviews: [],
                    },
                    overrideUserDeref: true,
                },
                waive_module: {
                    type: 'boolean',
                    optional: true,
                    default: false,
                },
                waive_comment: {
                    type: 'string',
                    optional: true,
                    acceptNewDoc: true,
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
            {
                defaultFilter: 'title',
            }
        )
    }

    public override async getFromDB(
        user: AuthUser,
        id: string,
        noDeref: boolean,
        userRoute: boolean
    ): Promise<IModule> {
        let mod = await super.getFromDB(user, id, noDeref, userRoute)

        if (!userRoute) {
            if (mod.waive_module) {
                // Warp waive files on admin GET
                mod.files = {
                    title: (<IFile>(<IFilemeta>mod?.files).latest).title,
                    src: getUrl(`files/static/${(<IFilemeta>mod.files).id}`),
                    old: true,
                } as any
            } else {
                // Delete files on admin GET
                delete mod.files
            }
        }

        return mod
    }

    // Dereference files
    public override async convertIDtoKEY(
        user: AuthUser,
        doc: IModule
    ): Promise<IModule> {
        let mod = await super.convertIDtoKEY(user, doc)

        if (mod.files && typeof mod.files === 'string') {
            let id = FilemetaManager.db.asId(mod.files)
            mod.files = await FilemetaManager.getFromDB(user, id, false, false)
        }

        return mod
    }

    protected override modifyDoc = (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IModule> => {
        // Set doc.waive_module flag if necessary
        if (doc.waive_comment) {
            doc.waive_module = true
        }
        if (doc.file) {
            console.log('--- .file detected, replacing with .files')
            doc.files = doc.file
            delete doc.file
        }

        return doc
    }

    //
    // PROCEEDING
    //

    /**
     * Calculates percent_complete based on the task status
     */
    private async calculatePercentComplete(mod: IModule) {
        let tasks = compressStepper<string>(mod.tasks)
        let comp = await TaskManager.db.assertEqualsFaster(
            tasks,
            'status',
            'COMPLETED'
        )
        let compAll = await comp.all()
        mod.percent_complete =
            (100 * (tasks.length - compAll.length)) / tasks.length
    }

    // Checks for automatic step/module advancing
    public async automaticAdvance(user: AuthUser, id: string) {
        return this.postAutomaticAdvance(user, await this.db.get(id))
    }

    public async postAutomaticAdvance(user: AuthUser, mod: IModule) {
        // Awaiting modules should be pushed to IN_PROGRESS
        if (mod.status === 'AWAITING') {
            mod.status = 'IN_PROGRESS'
        } else if (mod.status !== 'IN_PROGRESS') {
            // Only in-progress modules can be automatically advanced
            return
        }

        let currentStep = getStep<string>(mod.tasks, mod.currentStep)

        if (!currentStep) {
            throw this.internal(
                'postAutomaticAdvance',
                `${JSON.stringify(
                    mod
                )} has invalid currentStep field ${currentStep}`
            )
        }

        // Verify task statuses
        let invalids = await TaskManager.db.assertEqualsFaster(
            currentStep,
            'status',
            'COMPLETED'
        )

        // If there are tasks remaining
        if (invalids.hasNext) {
            console.log(
                `module ${
                    mod.id
                } failed auto-advance from ${currentStep}; tasks ${await invalids.all()}`
            )
            return
        }

        mod.currentStep++

        let nextStep = getStep<string>(mod.tasks, mod.currentStep)

        if (nextStep) {
            // If there is a next step set those to IN_PROGRESS
            await TaskManager.db.updateFaster(nextStep, 'status', 'IN_PROGRESS')
            // Calculate %-complete
            await this.calculatePercentComplete(mod)

            console.log(`Module ${mod.id} advanced to step ${mod.currentStep}`)
        } else {
            // If we can't find the next step, the module is complete
            mod.status = mod.waive_module ? 'WAIVED' : 'COMPLETED'
            // Set current step to -1
            mod.currentStep = -1
            // advance project
            if (!mod.project) {
                throw this.internal(
                    'postAutomaticAdvance',
                    `Module ${mod} has invalid .project field`
                )
            }
            await ProjectManager.db.assertIdExists(mod.project)
            await ProjectManager.automaticAdvance(user, mod.project)
            // Project is completed
            mod.percent_complete = 100

            console.log(`Module ${mod.id} completed; project advanced`)
        }

        // Update module
        await this.db.update(mod, { mergeObjects: false })
    }

    // Marks a module as 'COMPLETED'
    public async complete(user: AuthUser, id: string, force: boolean) {
        let mod = await this.db.get(id)
        return this.postComplete(user, mod, force)
    }

    private async postComplete(user: AuthUser, mod: IModule, force: boolean) {
        // Files with waives are marked 'WAIVED' instead of completed
        mod.status = mod.waive_module ? 'WAIVED' : 'COMPLETED'

        // Build an array of all tasks
        let allTasks = compressStepper<string>(mod.tasks)

        if (!force) {
            // Verify all tasks are completed in all steps
            let invalids = await TaskManager.db.assertEqualsFaster(
                allTasks,
                'status',
                'COMPLETED'
            )
            // If invalids has entries, one of the comparisons failed
            if (invalids.hasNext) {
                let all = await invalids.all()
                throw this.error(
                    'postComplete',
                    HTTPStatus.BAD_REQUEST,
                    `A Task is uncompleted.`,
                    `Module ${JSON.stringify(
                        mod
                    )} cannot be completed due to incomplete task(s) ${JSON.stringify(
                        all
                    )}`
                )
            }
        } else {
            // Mark all tasks as COMPLETED
            await TaskManager.db.updateFaster(allTasks, 'status', 'COMPLETED')
        }
        // Calculate %-complete
        await this.calculatePercentComplete(mod)
        // Update module
        await this.db.update(mod, { mergeObjects: false })
        // Advance project
        if (!mod.project) {
            throw this.internal(
                'postComplete',
                `Module ${mod} lacks project field`
            )
        }
        await ProjectManager.automaticAdvance(user, mod.project)
        return mod
    }

    // Start a module. Mark it from 'AWAITING' to 'IN_PROGRESS' and update
    // the first step's tasks
    public async start(user: AuthUser, id: string) {
        let mod = await this.db.get(id)
        if (mod.status !== 'AWAITING') {
            throw this.error(
                'start',
                HTTPStatus.BAD_REQUEST,
                'Module is not AWAITING',
                `${JSON.stringify(mod)} is not AWAITING`
            )
        }
        return this.postStartNextStep(user, mod)
    }

    // Restart a module. Clean it's file, mark all tasks as 'AWAITING',
    // then call `start` on it
    public async restart(user: AuthUser, id: string, full: boolean) {
        let mod = await this.db.get(id)
        mod.status = 'AWAITING'

        if (full) {
            // Reset files
            delete mod.files
        }

        // Set tasks to AWAITING
        let allTasks = compressStepper<string>(mod.tasks)
        await TaskManager.db.updateFaster(allTasks, 'status', 'AWAITING')

        // Start module
        return this.postStartNextStep(user, mod)
    }

    /**
     * Resets the module to factory conditions
     */
    public async reset(user: AuthUser, id: string) {
        console.log(`Reset called on module ${id}`)

        let mod = await this.db.get(id)
        mod.status = 'AWAITING'

        // Reset files
        delete mod.files

        // Set tasks to AWAITING
        let allTasks = compressStepper<string>(mod.tasks)
        await TaskManager.db.updateFaster(allTasks, 'status', 'AWAITING')
        // Update status and files
        await this.db.update(mod, { mergeObjects: false })
    }

    // Advances a module to the next step, or marks it as complete if
    // there are no steps left. If the module is 'AWAITING' move it to
    // 'IN_PROGRESS'
    public async advance(user: AuthUser, id: string, force: boolean) {
        let mod = await this.db.get(id)
        // If module is new, we don't need to validate steps
        if (mod.status !== 'AWAITING') {
            if (!force) {
                // Verifiy all tasks are completed in the current step
                // Pull current step array
                let currentStep = getStep<string>(mod.tasks, mod.currentStep)

                // Verify step is valid
                if (!currentStep) {
                    throw this.internal(
                        'advance',
                        `${JSON.stringify(
                            mod
                        )} has invalid currentStep field ${currentStep}`
                    )
                }

                // Verify task statuses
                let invalids = await TaskManager.db.assertEqualsFaster(
                    currentStep,
                    'status',
                    'COMPLETED'
                )
                // If invalids has entries, one of the comparisons failed
                if (invalids.hasNext) {
                    let all = await invalids.all()
                    throw this.error(
                        'advance',
                        HTTPStatus.BAD_REQUEST,
                        `A Task is uncompleted.`,
                        `Module ${JSON.stringify(
                            mod
                        )} cannot be advanced due to incomplete task(s) ${JSON.stringify(
                            all
                        )}`
                    )
                }
            } else {
                // Set all tasks in current step as COMPLETED
                let allTasks = compressStepper<string>(mod.tasks)
                await TaskManager.db.updateFaster(
                    allTasks,
                    'status',
                    'COMPLETED'
                )
            }
        }
        return this.postStartNextStep(user, mod)
    }

    private async postStartNextStep(user: AuthUser, mod: IModule) {
        // Calculate the next step. If not set, defaults to 0
        let nextStep = (mod.currentStep ?? -1) + 1

        // Awaiting modules should be started, not advanced
        if (mod.status === 'AWAITING') {
            mod.status = 'IN_PROGRESS'
            // Start from the first step
            nextStep = 0
        }

        let nextStepAr = getStep<string>(mod.tasks, nextStep)

        // Next key not found, therefore this module is complete
        if (!nextStepAr) {
            return this.postComplete(user, mod, false)
        }

        // Change tasks in next step to in-progress
        await TaskManager.db.updateFaster(nextStepAr, 'status', 'IN_PROGRESS')

        // Update step
        mod.currentStep = nextStep

        // Calculate %-complete
        await this.calculatePercentComplete(mod)
        // Update in the db
        await this.db.update(mod, { mergeObjects: false })
        return mod
    }
}

export const ModuleManager = new Module()
