import React, { useEffect } from "react";

export type StepSettings = {
     title: string
     children: JSX.Element | JSX.Element[]
     optional?: boolean
     completed?: boolean
}

export function Step(props: any) {
     useEffect(() => {
          props?.setBackText?.(props?.backText || "")
     }, []);
     
     return (
          <>
               {React.Children.map(props.children, element => {
                    return element;
               })}
          </>
     )
}