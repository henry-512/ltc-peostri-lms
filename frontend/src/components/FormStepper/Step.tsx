/**
* @file FormStepper step
* @module Step
* @category FormStepper
* @author Braden Cariaga
*/

import React, { useEffect } from "react";

export type StepSettings = {
    title?: string
    children: JSX.Element | JSX.Element[]
    optional?: boolean
    completed?: boolean
    setBackText?: Function
    setValidator?: Function
    backText?: string
    validator: any
}

/**
 * Step is a function that takes in props and returns a React component that renders the children of
 * the Step component.
 * @param {StepSettings} props - StepSettings - this is the props that are passed to the component
 * @returns A function that returns a component.
 */
export function Step(props: StepSettings) {
    useEffect(() => {
        props?.setBackText?.(props?.backText || "");
        props.setValidator?.(props.validator || "");
    }, []);

    return (
        <>
            {React.Children.map(props.children, element => {
                return element;
            })}
        </>
    )
}