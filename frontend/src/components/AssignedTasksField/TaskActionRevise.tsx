/**
* @file Review task action renders the button and dialogs for an review task.
* @module TaskActionRevise
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useRefresh, useUpdate, FileField, FileInput, useRecordContext, useShowContext } from "react-admin";
import { Button, Typography, Box, Tooltip } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler, useState } from "react";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DocumentViewer from "../DocumentViewer";
import AssignedDocumentsField from "../AssignedDocumentsField";

export type TaskActionReviseProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

/**
 * Review task action renders the button and dialogs for an review task.
 * @param {TaskActionReviseProps} props - TaskActionReviseProps
 */
const TaskActionRevise = (props: TaskActionReviseProps) => {
    const [update, { isLoading, error }] = useUpdate();
    const refresh = useRefresh();
    const task = useRecordContext();
    const { record } = useShowContext();

    /**
     * The handleClose function is a function that is called when the user clicks the close button. It
     * calls the close function that was passed in as a prop.
     */
    const handleClose = () => {
        props.close()
    }

    const handleSubmit = () => {

    }

    return (
        <> 
            <Box display="flex" gap="8px">
                <Button variant="outlined" onClick={props.setOpen}>
                    Revise
                </Button>
            </Box>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload Revision Comments" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"} submitIcon={<UploadFileIcon />}>
                { (!record.files.reviews && record.files.reviews.length < 1) ? <></> : <AssignedDocumentsField data={record.files.reviews} taskID={String(task.id)} /> }
                <Typography variant="subtitle1" mb="-.75rem">Please upload a new document:</Typography>
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

export default TaskActionRevise;

