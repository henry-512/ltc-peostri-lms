import { HTTPStatus } from '../../../lms/errors'
import { compressStepper, getStep, stepperKeyToNum } from '../../../lms/Stepper'
import { IFile, IFilemeta, IModule } from '../../../lms/types'
import { getUrl } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
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
                    old: true
                } as any
            } else {
                // Delete files on admin GET
                delete mod.files
            }
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

    // Checks for automatic step/module advancing
    public async automaticAdvance(user: AuthUser, id: string) {
        return this.postAutomaticAdvance(user, await this.db.get(id))
    }

    public async postAutomaticAdvance(user: AuthUser, mod: IModule) {
        // Only in-progress modules can be automatically advanced
        if (mod.status !== 'IN_PROGRESS') {
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
            return
        }

        mod.currentStep++

        // If we can't find the next step, the module is complete
        if (!getStep<string>(mod.tasks, mod.currentStep)) {
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
        }

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
        // Update module
        await this.db.update(mod, { mergeObjects: false })
        // Advance project
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
                `${mod} is not AWAITING`
            )
        }
        return this.postStartNextStep(user, mod)
    }

    // Restart a module. Clean it's file, mark all tasks as 'AWAITING',
    // then call `start` on it
    public async restart(user: AuthUser, id: string) {
        let mod = await this.db.get(id)
        mod.status = 'AWAITING'
        // Reset files
        delete mod.files

        // Set tasks to AWAITING
        let allTasks = compressStepper<string>(mod.tasks)
        await TaskManager.db.updateFaster(allTasks, 'status', 'AWAITING')

        // Start module
        return this.postStartNextStep(user, mod)
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
        // Pull current step
        let currentStep = mod.currentStep ?? 0

        // Awaiting modules should be started, not advanced
        if (mod.status === 'AWAITING') {
            mod.status = 'IN_PROGRESS'
            // Set to -1 to find lowest step key
            currentStep = -1
        }

        let nextStep = currentStep++

        let nextStepAr = getStep<string>(mod.tasks, nextStep)

        // Next key not found, therefore this module is complete
        if (!nextStepAr) {
            return this.postComplete(user, mod, false)
        }

        // Change tasks in next step to in-progress
        await TaskManager.db.updateFaster(nextStepAr, 'status', 'IN_PROGRESS')

        // Update step
        mod.currentStep = nextStep

        // Update in the db
        await this.db.update(mod, { mergeObjects: false })
        return mod
    }
}

export const ModuleManager = new Module()
