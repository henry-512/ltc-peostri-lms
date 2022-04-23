/**
* @file Main FormStepper component used to create separate steps on a form.
* @module FormStepper
* @category FormStepper
* @author Braden Cariaga
*/

import React from "react";
import { SimpleForm } from "react-admin"
import { FieldValues } from "react-hook-form";
import StepHeader from "./StepHeader";
import StepToolbar from "./StepToolbar"

export type FormStepperProps = {
    create?: boolean
    children: JSX.Element[]
    validate: (data: FieldValues) => FieldValues | Promise<FieldValues>
    defaultValues?: any
}

/**
 * Main FormStepper component used to create separate steps on a form.
 * @param {FormStepperProps} props - FormStepperProps
 * @returns 
 */
export default function FormStepper(props: FormStepperProps) {
    const [backText, setBackText] = React.useState("");
    const [activeStep, setActiveStep] = React.useState(0);
    const [skipped, setSkipped] = React.useState(new Set());
    const [validator, setValidator] = React.useState("");
    const optionalCache: number[] = [];

    /**
     * When the user clicks the reset button, the back text is set to an empty string.
     */
    const resetBackText = () => {
        setBackText("");
    }

    /**
     * If the optionalCache array contains the step number, return true, otherwise return false.
     * @param {number} step - The current step the user is on.
     * @returns a boolean value.
     */
    const isStepOptional = (step: number) => {
        return optionalCache.includes(step);
    };

    /**
     * This function takes a number and pushes it into an array.
     * @param {number} step - The step number to set as optional.
     */
    const setStepOptional = (step: number) => {
        optionalCache.push(step);
    }

    /**
     * The function isStepSkipped takes a number and returns a boolean.
     * @param {number} step - number
     * @returns A boolean value.
     */
    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };

    /**
     * If the step is skipped, delete it from the set of skipped steps, otherwise, increment the active
     * step by one.
     */
    const handleNext = () => {
        resetBackText();
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };

    /**
     * When the user clicks the back button, reset the back text and set the active step to the previous
     * active step.
     */
    const handleBack = () => {
        resetBackText();
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    /**
     * If the step is not optional, throw an error. Otherwise, reset the back text, set the active step
     * to the next step, and add the current step to the skipped set.
     */
    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        resetBackText();
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    return (
        <SimpleForm redirect="show" toolbar={
            <StepToolbar
                active={activeStep}
                optional={isStepOptional(activeStep)}
                stepCount={props.children.length}
                handleBack={handleBack}
                handleNext={handleNext}
                handleSkip={handleSkip}
                backText={backText}
                validator={validator}
                create={props.create || false}
                defaultValue={props.defaultValues}
            />
        } validate={props.validate} defaultValues={props.defaultValues} mode="onBlur" warnWhenUnsavedChanges>
            <StepHeader
                active={activeStep}
                children={props.children}
                setStepOptional={setStepOptional}
                isStepSkipped={isStepSkipped}
            />
            {React.cloneElement(props.children[activeStep], {
                setValidator: setValidator,
                setBackText: setBackText
            })}
        </SimpleForm>
    )
}