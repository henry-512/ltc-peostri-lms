/**
* @file Modules show sidebar component.
* @module ModulesShowAside
* @category ModulesPage
* @author Braden Cariaga
*/

import {
    DateField,
    FunctionField,
    TextField,
    useRecordContext,
    FileField
} from 'react-admin';
import {
    Typography,
    Card,
    CardContent,
    Box,
    Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getProgressStatus, getProgressStatusColor} from 'src/util/getProgressStatus';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WarningIcon from '@mui/icons-material/Warning';
import ProgressField from 'src/components/ProgressField';

const Aside = () => {
    const record = useRecordContext();
    return (
        <Box width={350} minWidth={350} display={{ xs: 'none', lg: 'block' }}>
            {record && <EventList />}
        </Box>
    );
};

const EventList = () => {
    const record = useRecordContext();

    const progressStatus = getProgressStatus(record.suspense);
    const progressStatusColor = getProgressStatusColor(record.suspense);

    return (
        <>
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
                                        Suspense
                                    </Typography>
                                    <DateField record={record} source="suspense" />
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
                                    <FunctionField record={record} variant="body2" fontWeight="600" render={(record: any) => `${(record.currentStep !== "-1") ? parseInt(String(record.currentStep)) : Object.keys(record.tasks).length} of ${Object.keys(record.tasks).length}`} />
                                </Box>
                            </Grid>

                            <Grid item xs={12}>
                                <ProgressField value={parseInt(record.percent_complete || "0")} color="secondary" />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
            {(record?.files?.latest || (record?.files?.reviews && record?.files?.reviews.length > 0)) ? 
                <Box ml={2} mt={2}>
                    <Card>
                        <CardContent>
                            {(record?.files?.reviews && record?.files?.reviews.length > 0) ? (<>
                                <Typography variant="h6" gutterBottom>
                                    Latest Comments:
                                </Typography>
                                <Box display="flex" flexDirection="column" marginBottom="1rem">
                                    {record?.files?.reviews.map((revision: any, index: number) => (
                                        <FileField record={revision} source="src" title="title" key={`revision-file-${index}`} target="_blank"/>
                                    ))}
                                </Box>
                            </>) : null }
                            {(record?.files?.latest) ? (<>
                                <Typography variant="h6" gutterBottom>
                                    Latest File:
                                </Typography>
                                <FileField record={record} source="files.latest.src" title="files.latest.title" target="_blank" />
                            </>) : null }
                        </CardContent>
                    </Card>    
                </Box>
            : null }
        </>
    );
};

export default Aside;