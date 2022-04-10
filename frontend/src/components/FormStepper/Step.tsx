import React, { useEffect } from "react";

export interface StepSettings {
    title: string
    children: JSX.Element | JSX.Element[]
    optional?: boolean
    completed?: boolean
}

export function Step(props: any) {
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