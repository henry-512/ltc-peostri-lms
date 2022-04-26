import { Box, IconButton, Breadcrumbs, Divider, Tooltip } from "@mui/material";
import { FunctionField, Link, Show, ReferenceManyField, ShowController, SimpleShowLayout, useCreatePath, useUpdate, useNotify, useRefresh } from "react-admin";
import Aside from "./Aside";
import EditIcon from '@mui/icons-material/Edit';
import TabbedProjectInfo from "src/components/TabbedProjectInfo";
import AssignedTasksField from "src/components/AssignedTasksField";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ActionButtons = ({record}: {record: any}) => {
    const createPath = useCreatePath();
    const [update, { isLoading, error }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    const complete = () => {
        update(`proceeding/projects/complete`, { id: record.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Submitted revision document.');
            },
            onError: (error: any) => {
                notify(`Document upload error: ${error.message}`, { type: 'warning' });
            },
        })
    }

    const restart = () => {
        update(`proceeding/projects/restart`, { id: record.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Submitted revision document.');
            },
            onError: (error: any) => {
                notify(`Document upload error: ${error.message}`, { type: 'warning' });
            },
        })
    }

    return (
        <>  
            <Tooltip title="Complete">
                <IconButton size="small" onClick={complete} >
                    <CheckCircleOutlineIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Restart">
                <IconButton size="small" onClick={restart} >
                    <RestartAltIcon />
                </IconButton>
            </Tooltip>
            <Tooltip title="Edit">
                <IconButton size="small" component={Link} to={createPath({ resource: 'admin/projects', id: record.id, type: 'edit' })} replace={true} >
                    <EditIcon />
                </IconButton>
            </Tooltip>
        </>
    )
}

export type ProjectShowProps = {

}

const ProjectShow = (props: ProjectShowProps) => {
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
                                    <ActionButtons record={record} />
                                )}
                            </ShowController>
                        </Box>
                    </Box>
                    <Divider sx={{ margin: "0 -15px" }} />
                    <ShowController>
                        {({record}) => (
                            <ReferenceManyField reference="tasks/assigned" filter={{ status: "IN_PROGRESS" }} target="project" sort={{ field: 'suspense', order: 'ASC' }} >
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