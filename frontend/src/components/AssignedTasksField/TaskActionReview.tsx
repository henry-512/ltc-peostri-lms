/**
* @file Review task action renders the button and dialogs for an review task.
* @module TaskActionReview
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useRefresh, useUpdate, FileField, FileInput, useRecordContext } from "react-admin";
import { Button, Typography, Box, Tooltip } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler, useState } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { red, green } from "@mui/material/colors";
import DocumentViewer from "../DocumentViewer";

export type TaskActionReviewProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

/**
 * Review task action renders the button and dialogs for an review task.
 * @param {TaskActionReviewProps} props - TaskActionReviewProps
 */
const TaskActionReview = (props: TaskActionReviewProps) => {
    const [update, { isLoading, error }] = useUpdate();
    const refresh = useRefresh();
    const record = useRecordContext();

    const [docOpen, setDocOpen] = useState(false);

    /**
     * The handleClose function is a function that is called when the user clicks the close button. It
     * calls the close function that was passed in as a prop.
     */
    const handleClose = () => {
        setDocOpen(false)
        props.close()
    }

    const handleDeny = (data: any) => {
        if (!data.file) return;
        update(`proceeding/tasks/review`, { id: props.id, data, previousData: {} }).finally(() => props.close()) 
    }

    const handleApprove = () => {
        update(`proceeding/tasks/complete`, { id: props.id, data: {}, previousData: {} }).then(() => refresh()).finally(() => props.close())
    }

    return (
        <> 
            <Box display="flex" gap="8px">
                <Tooltip title={"Reject"}>
                    <Button variant="outlined" onClick={props.setOpen} color="error" size="small" sx={{ minWidth: '0', padding: '8px', fontSize: '14px' }}>
                        <ThumbDownIcon fontSize="inherit" sx={{ color: red[500] }} />
                    </Button>
                </Tooltip>
                <Tooltip title={"Approve"}>
                    <Button variant="outlined" color="success" size="small" sx={{ minWidth: '0', padding: '8px', fontSize: '14px' }} onClick={handleApprove}>
                        <ThumbUpIcon fontSize="inherit" sx={{ color: green[500] }} />
                    </Button>
                </Tooltip>
                <Button variant="outlined" onClick={() => setDocOpen(true)}>
                    View
                </Button>
                <DocumentViewer 
                    open={docOpen} 
                    handleClose={() => setDocOpen(false)} 
                    ariaLabel={`document-reviewer-${record?.files?.latest?.title}`} 
                    label={record?.files?.latest?.title} 
                    src={record?.files?.latest?.src} 
                    maxWidth="md" 
                    actions={
                        [
                            <Tooltip title={"Reject"}>
                                <Button variant="outlined" onClick={props.setOpen} color="error" size="medium" sx={{ minWidth: '0', padding: '8px', fontSize: '18px' }} >
                                    <ThumbDownIcon fontSize="inherit" sx={{ color: red[500] }} />
                                    <Typography variant="button" ml="8px">Reject</Typography>
                                </Button>
                            </Tooltip>,
                            <Tooltip title={"Approve"}>
                                <Button variant="outlined" onClick={() => {
                                    handleApprove();
                                    props.close();
                                }} color="success" size="medium" sx={{ minWidth: '0', padding: '8px', fontSize: '18px' }} >
                                    <ThumbUpIcon fontSize="inherit" sx={{ color: green[500] }} />
                                    <Typography variant="button" ml="8px">Accept</Typography>
                                </Button>
                            </Tooltip>
                        ]
                    }       
                />
            </Box>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload Revision Comments" open={props.open} handleSubmit={handleDeny} handleClose={handleClose} submitText={"Reject"} submitColor="error" submitVariant="outlined" submitIcon={<ThumbDownIcon />}>
                <Typography variant="subtitle1" mb="-.75rem">Please upload a document with your revision comments:</Typography>
                <FileInput source="file" accept="application/pdf" fullWidth label=" " labelSingle="project.fields.waiver_file" helperText=" " sx={{
                    '& .RaFileInput-dropZone': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        border: '2px solid rgba(0, 0, 0, 0.04)',
                        boxSizing: 'border-box',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            borderColor: '#4f3cc9',
                            transition: 'all 0.2s ease',
                        }
                    }
                }}>
                    <FileField source="src" title="title" download={true} />
                </FileInput>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionReview;

