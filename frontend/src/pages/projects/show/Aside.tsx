import {
    DateField,
    useTranslate,
    FunctionField,
    TextField,
    useLocaleState,
    useRecordContext,
    ReferenceField,
    ReferenceArrayField,
} from 'react-admin';
import {
    Typography,
    Card,
    CardContent,
    Box,
    Stepper,
    Step,
    StepLabel,
    StepContent,
    Grid
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getProgressStatus, getProgressStatusColor} from 'src/util/getProgressStatus';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AvatarGroupField from 'src/components/AvatarGroupField';
import WarningIcon from '@mui/icons-material/Warning';
import ProgressField from 'src/components/ProgressField';

const Aside = () => {
    const record = useRecordContext();
    return (
        <Box width={400} display={{ xs: 'none', lg: 'block' }}>
            {record && <EventList />}
        </Box>
    );
};

const EventList = () => {
    const record = useRecordContext();
    const translate = useTranslate();
    const [locale] = useLocaleState();

    const progressStatus = getProgressStatus(record.suspense);
    const progressStatusColor = getProgressStatusColor(record.suspense);

    return (
        <Box ml={2}>
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Status
                    </Typography>
                    <Grid container rowSpacing={1} columnSpacing={1} marginBottom="0.35em">
                        <Grid item xs={6} display="flex" gap={1}>
                            <AutorenewIcon fontSize="small" color="disabled" />
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Status
                                </Typography>
                                <TextField source="status" />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} display="flex" gap={1}>
                            <WarningIcon fontSize="small" color={(progressStatus === "RED") ? "error" : (progressStatus === "AMBER") ? "warning" : "disabled"} />
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Progress Status
                                </Typography>
                                <FunctionField record={record} render={(record: any) => `${progressStatus}`} sx={{
                                    color: `${progressStatusColor}`
                                }} />
                            </Box>
                        </Grid>

                        <Grid item xs={6} display="flex" gap={1}>
                            <AccessTimeIcon fontSize="small" color="disabled" />
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Start
                                </Typography>
                                <DateField record={record} source="start" />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} display="flex" gap={1}>
                            <AccessTimeIcon fontSize="small" color="disabled" />
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Suspense
                                </Typography>
                                <DateField record={record} source="suspense" />
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="h6" gutterBottom>
                        Details
                    </Typography>
                    <Grid container rowSpacing={1} columnSpacing={1}>
                        {(record.team) ? (<>
                            <Grid item xs={6} display="flex" gap={1}>
                                <Box flexGrow={1}>
                                    <Typography variant="body2">
                                        Team
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid item xs={6} display="flex" gap={1}>
                                <Box flexGrow={1}>
                                    <ReferenceField source="team" reference="admin/teams">
                                        <TextField source="name" variant="body2" fontWeight="600" />
                                    </ReferenceField>
                                </Box>
                            </Grid>
                        </>) : null}

                        <Grid item xs={6} display="flex" gap={1}>
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Members
                                </Typography>
                            </Box>
                        </Grid>

                        <Grid item xs={6} display="flex" gap={1}>
                            <Box flexGrow={1}>
                                <ReferenceArrayField reference="admin/users" source="users">
                                    <AvatarGroupField height={24} width={24} fontSize="14px" max={6} />
                                </ReferenceArrayField>
                            </Box>
                        </Grid>
                    </Grid>
                    <Typography variant="h6" gutterBottom>
                        Statistics
                    </Typography>
                    <Grid container rowSpacing={1} columnSpacing={1}>
                        <Grid item xs={6} display="flex" gap={1}>
                            <Box flexGrow={1}>
                                <Typography variant="body2">
                                    Steps Complete
                                </Typography>
                            </Box>
                        </Grid>
                        
                        <Grid item xs={6} display="flex" gap={1}>
                            <Box flexGrow={1}>
                                <FunctionField record={record} variant="body2" fontWeight="600" render={(record: any) => `${parseInt(String(record.currentStep))} of ${Object.keys(record.modules).length}`} />
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <ProgressField value={parseInt(String(record.currentStep)) / Object.keys(record.modules).length} />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default Aside;