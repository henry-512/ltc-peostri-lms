/**
* @file Step tabber used to display the steps of the modules and tasks in a vertical tabber.
* @module StepTabber
* @category StepTabber
* @author Braden Cariaga
*/

import { Tabs, Box, Tab } from "@mui/material";
import StepContainer from './StepContainer'
import Panel from "./Panel";

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

export type StepTabberProps = {
    tab: number
    children: JSX.Element
    tabOptions: { name: string, content: any }[]
    handleChange: any
    reference: 'tasks' | 'modules'
}

const StepTabber = (props: StepTabberProps) => (
    <Box sx={{ flexGrow: 0, bgcolor: 'background.paper', display: 'flex', height: 'auto' }}>
        <Tabs
            orientation="vertical"
            variant="scrollable"
            value={props.tab}
            onChange={props.handleChange}
            aria-label="Module Tabbed List"
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
                {Object.keys(tabOption?.content).map((key, index) => (
                    <StepContainer key={key} id={key} step={tabOption.content[key]} startOpen={(index === 0)} reference={props.reference} >
                        {props.children}
                    </StepContainer>
                ))}
            </Panel>
        ))}
    </Box>
)

export default StepTabber;