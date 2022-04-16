import { Box } from "@mui/material";

export type DashboardWrapperProps = {
    children: JSX.Element | JSX.Element[]
}

const DashboardWrapper = (props: DashboardWrapperProps) => {
    return (
        <>
            <Box display="flex" flexWrap="wrap" justifyContent="flex-start" alignItems="flex-start" >
                {props.children}
            </Box>
        </>
    )
}

export default DashboardWrapper;