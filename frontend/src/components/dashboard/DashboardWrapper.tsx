import { Box } from "@material-ui/core";
import React from "react";

export type DashboardWrapperProps = {
    children: JSX.Element[]
}

const DashboardWrapper = (props: DashboardWrapperProps) => {
    return (
        <>
            <Box display="flex" flexWrap={true} justifyContent="flex-start" alignItems="flex-start" >
                {props.children.map((child: JSX.Element, i: number) => {
                    React.cloneElement(child, {
                        key: i
                    })
                })}
            </Box>
        </>
    )
}

export default DashboardWrapper;