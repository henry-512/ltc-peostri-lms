/**
* @file Main panel wrapper for the step tabber.
* @module Panel
* @category StepTabber
* @author Braden Cariaga
*/

import { Box } from "@mui/material";

export interface PanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

export default function Panel(props: PanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`vertical-tabpanel-${index}`}
            aria-labelledby={`vertical-tab-${index}`}
            style={{
                flexShrink: '3',
                width: '100%'
            }}
            {...other}
        >
            {value === index && (
                <Box margin="5px" flex="1" width='100%'>
                    {children}
                </Box>
            )}
        </div>
    );
}