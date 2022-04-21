import { APIError, HTTPStatus } from "./errors"

/**
 * Arrays of T, indexed by strings
 */
 export interface IStepper<T> {
    [key: string]: T[]
}

/**
 * Flattens a stepper into an array of its entries
 */
export function compressStepper<T>(stepper: IStepper<any>) {
    let all: T[] = []
    for (const [_, tasks] of Object.entries(stepper)) {
        all = all.concat(tasks)
    }
    return all
}

/**
 * Builds a stepper key (key-[X]) from a number
 */
export function buildStepperKey(num: number) {
    return `key-${num}`
}

/**
 * Converts a stepper key (key-[X]) to its number [X]
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

export async function fixStepper(stepper: IStepper<any>) {
    let newStepper: IStepper<any> = {}

    let ni = 0
    await stepperForEachInOrderSafe(stepper, async (i) => {
        newStepper[buildStepperKey(ni)] = stepper[buildStepperKey(i)]
        ni++
    })

    return newStepper
}

export async function stepperForEachInOrderSafe(
    stepper: IStepper<any>,
    cb: (i: number) => Promise<void | false>
) {
    // All step keys
    let stepKeys = Object.keys(stepper)
    // Start with -1
    let currentStep = -1
    while (true) {
        stepKeys = stepKeys ?? Object.keys(stepper)

        // Defaults to 9999 to signify the next step being unfound
        let nextStep = 9999

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
            return
        }

        // Callback returns false, quit
        if ((await cb(nextStep)) === false) {
            return
        }
        // Increment counter
        currentStep = nextStep
    }
}

export async function stepperForEachInOrder<T>(
    stepper: IStepper<T>,
    cb: (i: number, ar: T[]) => Promise<void | false>
) {
    for (let i = 0; true; i++) {
        let stepKey = buildStepperKey(i)
        let stepAr = stepper[stepKey]

        if (stepAr && (await cb(i, stepper[stepKey])) !== false) {
            break
        }
    }
}

export function getStep<T>(stepper: IStepper<any>, step: number): T[] {
    let key = buildStepperKey(step)
    let s = stepper[key]
    return s as T[]
}
