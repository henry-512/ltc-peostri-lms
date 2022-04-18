import { Box, Typography, Tab, IconButton, Breadcrumbs, Divider, List, ListItem, ListItemText } from "@mui/material";
import { useState } from "react";
import { FunctionField, Link, Show, ShowContextProvider, ShowController, SimpleShowLayout, useCreatePath } from "react-admin";
import Aside from "./Aside";
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import { useNavigate } from "react-router";
import EditIcon from '@mui/icons-material/Edit';
import TabbedProjectInfo from "./TabbedProjectInfo";

type ProjectShowProps = {

}

const ProjectShow = (props: ProjectShowProps) => {
    const createPath = useCreatePath();

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
                            <ShowController>
                                {({record}) => (
                                    <IconButton size="small" component={Link} to={createPath({ resource: 'admin/projects', id: record.id, type: 'edit' })} replace={true} >
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </ShowController>
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
                    <TabbedProjectInfo />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;