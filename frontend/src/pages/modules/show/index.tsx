import { Box, IconButton, Breadcrumbs, Divider, Tooltip } from "@mui/material";
import { FunctionField, Link, ReferenceField, Show, ShowController, SimpleShowLayout, useCreatePath, TextField, ReferenceArrayField, useUpdate, useNotify, useRefresh } from "react-admin";
import Aside from "./Aside";
import EditIcon from '@mui/icons-material/Edit';
import TabbedModuleInfo from "src/components/TabbedModuleInfo";
import AssignedTasksField from "src/components/AssignedTasksField";
import FastForwardIcon from '@mui/icons-material/FastForward';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const ActionButtons = ({record}: {record: any}) => {
    const createPath = useCreatePath();
    const [update, { isLoading, error }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    const complete = () => {
        update(`proceeding/modules/complete`, { id: record.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Successfully completed the module.');
            },
            onError: (error: any) => {
                notify(`Complete error: ${error.message}`, { type: 'warning' });
            },
        })
    }

    const restart = () => {
        update(`proceeding/modules/restart`, { id: record.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Successfully restarted the module.');
            },
            onError: (error: any) => {
                notify(`Restart error: ${error.message}`, { type: 'warning' });
            },
        })
    }

    const advance = () => {
        update(`proceeding/modules/advance`, { id: record.id, data: {}, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Successfully advanced the module.');
            },
            onError: (error: any) => {
                notify(`Advance error: ${error.message}`, { type: 'warning' });
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
            <Tooltip title="Advance">
                <IconButton size="small" onClick={advance} >
                    <FastForwardIcon />
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

const ModuleShow = () => {
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
                                    <ActionButtons record={record} />
                                )}
                            </ShowController>
                        </Box>
                    </Box>
                    <Divider sx={{ margin: "0 -15px" }} />
                    <ShowController>
                        {({record}) => (
                            <ReferenceArrayField record={{ id: record.tasks[`key-${record.currentStep}`] }} reference="tasks/assigned" filter={{ status: "IN_PROGRESS" }} source="id" sort={{ field: 'suspense', order: 'ASC' }} >
                                <AssignedTasksField />
                            </ReferenceArrayField>
                        )}
                    </ShowController>
                    <TabbedModuleInfo />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ModuleShow;