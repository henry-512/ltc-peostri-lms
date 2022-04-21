import { HTTPStatus } from '../../../lms/errors'
import { compressStepper, getStep, stepperKeyToNum } from '../../../lms/Stepper'
import { IModule } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
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
                file: {
                    type: 'fkey',
                    managerName: 'filemeta',
                    optional: true,
                    acceptNewDoc: true,
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

    protected override modifyDoc = (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IModule> => {
        // Set doc.waive_module flag if necessary
        if (doc.waive_comment) {
            doc.waive_module = true
        }

        return doc
    }

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
                'advance',
                `${JSON.stringify(
                    mod
                )} has invalid currentStep field ${currentStep}`
            )
        }

        // Verify task statuses
        let invalids = await TaskManager.db.assertEqualsFaster(
            currentStep,
            'd.status',
            'COMPLETED'
        )

        // If there are tasks remaining
        if (invalids.hasNext) {
            return
        }

        mod.currentStep++

        // If we can't find the next step, the module is complete
        if (!getStep<string>(mod.tasks, mod.currentStep)) {
            mod.status = mod.waive ? 'WAIVED' : 'COMPLETED'
            // Set current step to -1
            mod.currentStep = -1
            // advance project
        }

        mod.id = mod._id
        await this.db.update(mod, { mergeObjects: false })
    }

    // Marks a module as 'COMPLETED'
    public async complete(user: AuthUser, id: string, force: boolean) {
        let mod = await this.db.get(id)
        return this.postComplete(user, mod, force)
    }

    private async postComplete(user: AuthUser, mod: IModule, force: boolean) {
        // Files with waives are marked 'WAIVED' instead of completed
        mod.status = mod.waive ? 'WAIVED' : 'COMPLETED'

        // Build an array of all tasks
        let allTasks = compressStepper<string>(mod.tasks)

        if (!force) {
            // Verify all tasks are completed in all steps

            // Verify task statuses
            let invalids = await TaskManager.db.assertEqualsFaster(
                allTasks,
                'd.status',
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
        return this.postStartStep(user, mod)
    }

    // Restart a module. Clean it's file, mark all tasks as 'AWAITING',
    // then call `start` on it
    public async restart(user: AuthUser, id: string) {
        let mod = await this.db.get(id)
        mod.status = 'AWAITING'
        // Reset files
        mod.file = undefined

        // Set tasks to AWAITING
        let allTasks = compressStepper<string>(mod.tasks)
        await TaskManager.db.updateFaster(allTasks, 'status', 'AWAITING')

        // Start module
        return this.postStartStep(user, mod)
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
                    'd.status',
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
        return this.postStartStep(user, mod)
    }

    private async postStartStep(user: AuthUser, mod: IModule) {
        // Pull current step
        let currentStep = mod.currentStep ?? 0

        // Awaiting modules should be started, not advanced
        if (mod.status === 'AWAITING') {
            mod.status = 'IN_PROGRESS'
            // Set to -1 to find lowest step key
            currentStep = -1
        }

        // The next step to process
        // Defaults to 9999 to signify the next step being unfound
        let nextStep = 9999

        // All step keys
        let stepKeys = Object.keys(mod.tasks)

        for (let k of stepKeys) {
            let kNum = stepperKeyToNum(k)
            // kNum > currentStep <- this step is after the current
            // If kNum < nextStep <- this step is before the last
            //                        recorded nextStep
            if (kNum < nextStep && kNum > currentStep) {
                nextStep = kNum
            }
        }

        // Next key not found, therefore this module is complete
        if (nextStep === 9999) {
            return this.postComplete(user, mod, false)
        }

        // Change tasks in next step to in-progress
        await TaskManager.db.updateFaster(
            mod.tasks[nextStep] as string[],
            'status',
            'IN_PROGRESS'
        )

        // Update step
        mod.currentStep = nextStep

        // Update in the db
        await this.db.update(mod, { mergeObjects: false })
        return mod
    }
}

export const ModuleManager = new Module()
