import { Box, Typography, IconButton, Breadcrumbs, Divider } from "@mui/material";
import { FunctionField, Link, ReferenceField, Show, ShowController, SimpleShowLayout, useCreatePath, TextField, ReferenceArrayField } from "react-admin";
import Aside from "./Aside";
import EditIcon from '@mui/icons-material/Edit';
import TabbedProjectInfo from "./TabbedModuleInfo";
import TaskGrid from "./TaskGrid";
import AssignedTasksField from "./AssignedTasksField";

type ModuleShowProps = {

}

const ModuleShow = (props: ModuleShowProps) => {
    const createPath = useCreatePath();

    return (
        <Show aside={<Aside />} title={"Viewing Project"}>
            <SimpleShowLayout>
                <Box display="flex" flexDirection="column" gap="10px">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center">
                            <Breadcrumbs aria-label="breadcrumb">
                                <ReferenceField reference="projects" source="project" link="show">
                                    <TextField variant="h6" source="title" />
                                </ReferenceField>
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
                                    <IconButton size="small" component={Link} to={createPath({ resource: 'admin/projects', id: record.project, type: 'edit' })} replace={true} >
                                        <EditIcon />
                                    </IconButton>
                                )}
                            </ShowController>
                        </Box>
                    </Box>
                    <Divider sx={{ margin: "0 -15px" }} />
                    <ShowController>
                        {({record}) => (
                            <ReferenceArrayField record={{ id: record.tasks[`key-${record.currentStep}`] }} reference="tasks" source="id" >
                                <AssignedTasksField />
                            </ReferenceArrayField>
                        )}
                    </ShowController>
                    <TabbedProjectInfo />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ModuleShow;