import { Box, Typography, Tab, IconButton, Breadcrumbs } from "@mui/material";
import { useState } from "react";
import { FunctionField, Link, ReferenceArrayField, ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import { SectionTitle } from "src/components/misc";
import getProgressStatus from "src/util/getProgressStatus";
import Aside from "./Aside";
import AvatarGroupField from "./AvatarGroupField";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { useNavigate } from "react-router";

type ProjectTabs = "DOCS" | "INFO" | "MODULES" | "TASKS"

type ProjectShowProps = {

}

const ProjectShow = (props: ProjectShowProps) => {
    const [tab, setTab] = useState<ProjectTabs>("INFO");
    const navigate = useNavigate();

    const handleChange = (event: React.SyntheticEvent, newValue: ProjectTabs) => {
        setTab(newValue);
    };

    const goBack = () => navigate(-1);

    return (
        <Show aside={<Aside />} title={"Viewing Project"}>
            <SimpleShowLayout>
                <Box display="flex" justifyContent="space-between" alignItems="center" paddingBottom="0" >
                    <Box display="flex" flexDirection="column">
                        <Box display="flex" alignItems="center">
                            <Breadcrumbs aria-label="breadcrumb">
                                <Link
                                    color="inherit"
                                    to="/projects"
                                    replace={true}
                                >
                                    <Typography variant="h6">My Projects</Typography>
                                </Link>
                                <Link
                                    color="text.primary"
                                    to=""
                                    replace={true}
                                    aria-current="page"
                                >
                                    <FunctionField source="title" variant="h6" render={(record: any) => `${record.title}`} />
                                </Link>
                            </Breadcrumbs>
                        </Box>    
                    </Box>
                    <Box>
                        {/* TODO ADD ACTION BAR HERE */}
                    </Box>
                </Box>
                <TabContext value={tab}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList onChange={handleChange} aria-label="Project-Tabs" variant="fullWidth">
                            <Tab label="Info" value="INFO" />
                            <Tab label="Documents" value="DOCS" />
                            <Tab label="Modules" value="MODULES" />
                            <Tab label="Tasks" value="TASKS" />
                        </TabList>
                    </Box>
                    <TabPanel value="INFO">
                        {/* IN_PROGRESS MODULES */}
                        {/* AWAITING USERS */}
                    </TabPanel>
                    <TabPanel value="DOCS"></TabPanel>
                    <TabPanel value="MODULES"></TabPanel>
                    <TabPanel value="TASKS"></TabPanel>
                </TabContext>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;