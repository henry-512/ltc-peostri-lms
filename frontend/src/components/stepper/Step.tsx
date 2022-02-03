import React from "react";

export type StepSettings = {
     title: string
     children: JSX.Element | JSX.Element[]
     optional?: boolean
     completed?: boolean
}

export function Step(props: any) {
     return (
          <>
               {React.Children.map(props.children, element => {
                    return element;
               })}
          </>
     )
}