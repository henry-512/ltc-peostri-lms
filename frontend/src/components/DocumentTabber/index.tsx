/**
* @file Main document tabber component which enables the use of a vertial tabber to separate documents.
* @module DocumentTabber
* @category DocumentTabber
* @author Braden Cariaga
*/

import { Tabs, Box, Tab } from "@mui/material";
import Container from './Container'
import Panel from "./Panel";

/**
 * It returns an object with two properties, id and aria-controls, where the values of the properties
 * are strings.
 * @param {number} index
 * @returns An object with two properties.
 */
function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export type DocumentTabberProps = {
    tab: number
    tabOptions: { name: string, content: any, container?: boolean, element: JSX.Element }[]
    handleChange: any
}

/**
 * Main document tabber component which enables the use of a vertial tabber to separate documents.
 * @param {DocumentTabberProps} props - DocumentTabberProps
 */
const DocumentTabber = (props: DocumentTabberProps) => (
    <Box sx={{ flexGrow: 0, bgcolor: 'background.paper', display: 'flex', height: 'auto' }}>
        <Tabs
            orientation="vertical"
            variant="scrollable"
            value={props.tab}
            onChange={props.handleChange}
            aria-label="document-tabbed-list"
            sx={{ borderRight: 1, borderColor: 'divider' }}
        >
            {props.tabOptions?.map((tabOption, index) => (
                <Tab key={`tab-option-btn-${index}`} label={tabOption?.name} {...a11yProps(index)} sx={{
                    flexShrink: '0',
                    flexGrow: '3'
                }}/>
            ))}
        </Tabs>
        {props.tabOptions?.map((tabOption, index) => (
            <Panel key={`tab-option-${index}`} value={props.tab} index={index}>
                {(tabOption?.container) ? (
                    <Container id={`container-option-${index}`} startOpen={(index == 0)} >
                        {tabOption.element}
                    </Container>
                ) : (
                    tabOption.element
                )}
            </Panel>
        ))}
    </Box>
)

export default DocumentTabber;