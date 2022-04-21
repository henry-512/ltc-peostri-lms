import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import { useState } from "react";
import TasksTabbedList from "./TasksTabbedList";

type ModuleTabs = "DOCS" | "TASKS" | "LOGS";

type TabbedModuleInfoProps = {

}

const TabbedModuleInfo = (props: TabbedModuleInfoProps) => {
    const [tab, setTab] = useState<ModuleTabs>("TASKS");
    const handleChange = (event: React.SyntheticEvent, newValue: ModuleTabs) => {
        setTab(newValue);
    };

    return (
        <>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', margin: '-10px 0 0 0' }}>
                    <TabList onChange={handleChange} aria-label="Project-Tabs" variant="fullWidth">
                        <Tab label="Tasks" value="TASKS" />
                        <Tab label="Documents" value="DOCS" />
                        <Tab label="Logs" value="LOGS" />
                    </TabList>
                </Box>
                <TabPanel value="TASKS" sx={{
                    padding: '0'
                }}>
                    <TasksTabbedList />
                </TabPanel>
                <TabPanel value="DOCS" sx={{
                    padding: '0'
                }}>

                </TabPanel>
                <TabPanel value="LOGS" sx={{
                    padding: '0'
                }}>

                </TabPanel>
            </TabContext>
        </>
    )
}

export default TabbedModuleInfo;