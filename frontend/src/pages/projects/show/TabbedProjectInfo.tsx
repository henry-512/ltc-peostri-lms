import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import { useState } from "react";
import ModulesTabbedList from "./ModulesTabbedList";
import DocumentList from "./DocumentList";

type ProjectTabs = "DOCS" | "MODULES" | "LOGS";

type TabbedProjectInfoProps = {

}

const TabbedProjectInfo = (props: TabbedProjectInfoProps) => {
    const [tab, setTab] = useState<ProjectTabs>("MODULES");
    const handleChange = (event: React.SyntheticEvent, newValue: ProjectTabs) => {
        setTab(newValue);
    };

    return (
        <>
            <TabContext value={tab}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', margin: '-10px 0 0 0' }}>
                    <TabList onChange={handleChange} aria-label="Project-Tabs" variant="fullWidth">
                        <Tab label="Modules" value="MODULES" />
                        <Tab label="Documents" value="DOCS" />
                        <Tab label="Logs" value="LOGS" />
                    </TabList>
                </Box>
                <TabPanel value="MODULES" sx={{
                    padding: '0'
                }}>
                    <ModulesTabbedList />
                </TabPanel>
                <TabPanel value="DOCS" sx={{
                    padding: '0'
                }}>
                    <DocumentList />
                </TabPanel>
                <TabPanel value="LOGS" sx={{
                    padding: '0'
                }}>

                </TabPanel>
            </TabContext>
        </>
    )
}

export default TabbedProjectInfo;