import { Tabs, Box, Tab } from "@mui/material";
import { useShowContext } from "react-admin";
import { useState } from "react";
import { IModuleStep } from "src/util/types";
import StepContainer from './StepContainer'
import TabPanel from './TabPanel'

function a11yProps(index: number) {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-${index}`,
    };
}

const ModulesTabbedList = () => {
    const {
        defaultTitle, // the translated title based on the resource, e.g. 'Post #123'
        error,  // error returned by dataProvider when it failed to fetch the record. Useful if you want to adapt the view instead of just showing a notification using the `onError` side effect.
        isFetching, // boolean that is true while the record is being fetched, and false once the record is fetched
        isLoading, // boolean that is true until the record is available for the first time
        record, // record fetched via dataProvider.getOne() based on the id from the location
        refetch, // callback to refetch the record via dataProvider.getOne()
        resource, // the resource name, deduced from the location. e.g. 'posts'
    } = useShowContext();

    //const { data: currentModules } = useGetList(`modules`, { filter: { status: 'IN_PROGRESS', project: record.id }, sort: { field: 'suspense', order: 'ASC' }, pagination: { page: 1, perPage: 100 } });
    //const { data: upcomingModules } = useGetList(`modules`, { filter: { status: 'AWAITING', project: record.id }, sort: { field: 'suspense', order: 'ASC' }, pagination: { page: 1, perPage: 100 } });
    //const { data: completedModules } = useGetList(`modules`, { filter: { status: ['COMPLETED', 'WAIVED', 'ARCHIVED'], project: record.id }, sort: { field: 'suspense', order: 'ASC' }, pagination: { page: 1, perPage: 100 } });

    const currentModules = { [`key-${record.currentStep}`]: record.modules[`key-${record.currentStep}`] }
    const upcomingModules = (() => {
        let steps = {} as IModuleStep;
        for (let i = record.currentStep + 1; i < Object.keys(record.modules).length; i++) {
            steps[`key-${i}`] = record.modules[`key-${i}`];
        }
        return steps;
    })()
    const completedModules = (() => {
        let steps = {} as IModuleStep;
        for (let i = record.currentStep - 1; i >= 0; i--) {
            steps[`key-${i}`] = record.modules[`key-${i}`];
        }
        return steps;
    })()

    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const tabOptions = [];
    if (currentModules && Object.keys(currentModules).length > 0) tabOptions.push({ name: 'Current', modules: currentModules });
    if (upcomingModules && Object.keys(upcomingModules).length > 0) tabOptions.push({ name: 'Upcoming', modules: upcomingModules });
    if (completedModules && Object.keys(completedModules).length > 0)  tabOptions.push({ name: 'Completed', modules: completedModules });

    return (
        <>
            <Box sx={{ flexGrow: 0, bgcolor: 'background.paper', display: 'flex', height: 'auto' }}>
                <Tabs
                    orientation="vertical"
                    variant="scrollable"
                    value={tab}
                    onChange={handleChange}
                    aria-label="Module Tabbed List"
                    sx={{ borderRight: 1, borderColor: 'divider' }}
                >
                    {tabOptions?.map((tabOption, index) => (
                        <Tab key={`tab-option-btn-${index}`} label={tabOption?.name} {...a11yProps(index)} sx={{
                            flexShrink: '0',
                            flexGrow: '3'
                        }}/>
                    ))}
                </Tabs>
                {tabOptions?.map((tabOption, index) => (
                    <TabPanel key={`tab-option-${index}`} value={tab} index={index}>
                        {Object.keys(tabOption?.modules).map((modKey, index) => (
                            <StepContainer key={modKey} id={modKey} step={tabOption.modules[modKey]} startOpen={(index == 0)} />
                        ))}
                    </TabPanel>
                ))}
            </Box>
        </>
    )
}

export default ModulesTabbedList;