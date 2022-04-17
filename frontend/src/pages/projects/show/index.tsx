import { Box, Typography, Tab, IconButton, Breadcrumbs, Divider, List, ListItem, ListItemText } from "@mui/material";
import { useState } from "react";
import { FunctionField, Link, Show, SimpleShowLayout } from "react-admin";
import Aside from "./Aside";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useNavigate } from "react-router";
import EditIcon from '@mui/icons-material/Edit';

type ProjectTabs = "DOCS" | "COMPLETED_MODULES" | "ACTIVE_MODULES" | "LOGS";

type ProjectShowProps = {

}

const ProjectShow = (props: ProjectShowProps) => {
    const [tab, setTab] = useState<ProjectTabs>("ACTIVE_MODULES");
    const navigate = useNavigate();

    const handleChange = (event: React.SyntheticEvent, newValue: ProjectTabs) => {
        setTab(newValue);
    };

    const goBack = () => navigate(-1);

    return (
        <Show aside={<Aside />} title={"Viewing Project"}>
            <SimpleShowLayout>
                <Box display="flex" flexDirection="column" gap="10px">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
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
                        <Box>
                            <IconButton size="small">
                                <EditIcon />
                            </IconButton>
                        </Box>
                    </Box>
                    <Divider sx={{ margin: "0 -15px" }} />
                    <Box>
                        <Typography variant="h6">
                            Tasks Needing Your Attention:
                        </Typography>
                        {/* Fetch and Display MyTasks */}
                        <List>
                            <ListItem>
                                <ListItemText primary="Some Task" />
                            </ListItem>
                        </List>
                    </Box>
                    <TabContext value={tab}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', margin: '-10px 0 0 0' }}>
                            <TabList onChange={handleChange} aria-label="Project-Tabs" variant="fullWidth">
                                <Tab label="Active Modules" value="ACTIVE_MODULES" />
                                <Tab label="Completed Modules" value="COMPLETED_MODULES" />
                                <Tab label="Documents" value="DOCS" />
                                <Tab label="Documents" value="LOGS" />
                            </TabList>
                        </Box>
                        <TabPanel value="ACTIVE_MODULES">
                            {/* IN_PROGRESS MODULES */}
                            
                        </TabPanel>
                        <TabPanel value="COMPLETED_MODULES"></TabPanel>
                        <TabPanel value="DOCS"></TabPanel>
                        <TabPanel value="LOGS"></TabPanel>
                    </TabContext>
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;