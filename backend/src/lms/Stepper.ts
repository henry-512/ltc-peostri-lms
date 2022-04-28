import { APIError, HTTPStatus } from './errors'

/**
 * Arrays of type T, indexed by strings. Used to represent process flow
 * dependency. `key` is nominally of the form `key-X`, where `X` is a positive
 * 0-inclusive integer.
 *
 * @typeParam T The type of the internal arrays
 */
export interface IStepper<T> {
    [key: string]: T[]
}

/**
 * Flattens a stepper into an array of its entries.
 *
 * @typeParam T The type of array to return
 * @param stepper The stepper object to compress
 * @return An array of T for all elements in the stepper
 */
export function compressStepper<T>(stepper: IStepper<any>) {
    let all: T[] = []
    for (const [_, tasks] of Object.entries(stepper)) {
        all = all.concat(tasks)
    }
    return all
}

/**
 * Builds a stepper key (key-[X]) from a number index.
 *
 * @param num A positive integer
 */
export function buildStepperKey(num: number) {
    return `key-${num}`
}

/**
 * Converts a stepper key (key-[X]) to its number [X].
 *
 * @param stepKey A stepper key `key-X`
 * @return An integer `X`
 */
export function stepperKeyToNum(stepKey: string) {
    if (stepKey.length <= 4) {
        throw new APIError(
            'util',
            'stepperKeyToNum',
            HTTPStatus.INTERNAL_SERVER_ERROR,
            'Invalid system state',
            `Stepper key ${stepKey} invalid`
        )
    }
    return parseInt(stepKey.slice(4))
}

/**
 * Rebuilds an IStepper so that it starts with `key-0` and does not skip any
 * steps. The stepper values point to the same values as the original stepper.
 *
 * @param stepper The stepper to parse
 * @return A new stepper in a consistent order
 */
export function fixStepper(stepper: IStepper<any>): IStepper<any> {
    let newStepper: IStepper<any> = {}

    // The next step
    let nextIndex = 0

    // All step keys
    let stepKeys = Object.keys(stepper)
    // Start with -1
    let currentStep = -1
    while (true) {
        stepKeys = stepKeys ?? Object.keys(stepper)

        // Defaults to 9999 to signify the next step being unfound
        let nextStep = 9999

        // Find the next stepper key
        for (let k of stepKeys) {
            let kNum = stepperKeyToNum(k)
            // kNum > currentStep <- this step is after the current
            // If kNum < nextStep <- this step is before the last
            //                        recorded nextStep
            if (kNum < nextStep && kNum > currentStep) {
                nextStep = kNum
            }
        }

        // Next key not found, therefore this stepper is completed
        if (nextStep === 9999) {
            // Return the new stepper
            return newStepper
        }

        // Add the next step to the new stepper
        newStepper[buildStepperKey(nextIndex)] =
            stepper[buildStepperKey(nextStep)]
        // Increment next index
        nextIndex++

        // Increment counter
        currentStep = nextStep
    }
}

/**
 * Runs the passed function on each element of the stepper, in order.
 *
 * @param cb Called on each element of the stepper. Returns `false` if the loop should break.
 * @returns True iff the iterator consumed all steps
 */
export async function stepperForEachInOrder<T>(
    stepper: IStepper<T>,
    cb: (i: number, ar: T[], key: string) => Promise<void | false>
) {
    for (let i = 0; true; i++) {
        let stepKey = buildStepperKey(i)
        let stepAr = stepper[stepKey]

        // Check if the stepper is expended
        if (!stepAr) {
            return true
        } else if ((await cb(i, stepAr, stepKey)) === false) {
            // If the callback returns false, return early
            return false
        }
    }
}

/**
 * Gets the array associated with the passed step.
 *
 * @typeParam T The type of the return array
 * @param stepper The `IStepper` object
 * @param step The integer key to index
 */
export function getStep<T>(stepper: IStepper<any>, step: number): T[] {
    return stepper[buildStepperKey(step)]
}
