import { Box, IconButton, Breadcrumbs, Divider } from "@mui/material";
import { FunctionField, Link, Show, ReferenceManyField, ShowController, SimpleShowLayout, useCreatePath } from "react-admin";
import Aside from "./Aside";
import EditIcon from '@mui/icons-material/Edit';
import TabbedProjectInfo from "src/components/TabbedProjectInfo";
import AssignedTasksField from "src/components/AssignedTasksField";

export type ProjectShowProps = {

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
                    <ShowController>
                        {({record}) => (
                            <ReferenceManyField reference="tasks/assigned" filter={{ satus: "IN_PROGRESS" }} target="project" sort={{ field: 'suspense', order: 'ASC' }} >
                                <AssignedTasksField />
                            </ReferenceManyField>
                        )}
                    </ShowController>
                    <TabbedProjectInfo />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;