/**
* @file The Panel component is a child of the Tabs component and is responsible for rendering the content of
* each tab.
* @module Panel
* @category DocumentTabber
* @author Braden Cariaga
*/

import { Box } from "@mui/material";

export interface PanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

/**
 * The Panel component is a child of the Tabs component and is responsible for rendering the content of
 * each tab.
 * @param {PanelProps} props - PanelProps
 * @returns A div with a role of tabpanel, hidden if the value is not equal to the index, with an id of
 * vertical-tabpanel-index, aria-labelledby of vertical-tab-index, flexShrink of 3, width of 100%, and
 * children.
 */
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