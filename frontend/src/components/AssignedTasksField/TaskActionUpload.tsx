/**
* @file Upload task action renders the button and dialogs for an upload task.
* @module TaskActionUpload
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useNotify, useUpdate, FileField, FileInput, useRecordContext } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useRefresh } from 'react-admin';

export type TaskActionUploadProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

/**
 * Upload task action renders the button and dialogs for an upload task.
 * @param {TaskActionUploadProps} props
 */
const TaskActionUpload = (props: TaskActionUploadProps) => {
    const [update, { isLoading, error }] = useUpdate();
    const refresh = useRefresh();

    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/upload`, { id: props.id, data, previousData: {} }).then(() => refresh()).finally(() => props.close())   
    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                UPLOAD
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload a File to the Module" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"} submitIcon={<AddBoxIcon />}>
                <FileInput source="file" accept="application/pdf" fullWidth label="project.fields.waive_file_upload" labelSingle="project.fields.waiver_file" helperText=" " sx={{
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

export default TaskActionUpload;

