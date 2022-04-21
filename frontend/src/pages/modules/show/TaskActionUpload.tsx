import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useRedirect, useNotify, FileField, FileInput } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";

export type TaskActionUploadProps = {
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

const TaskActionUpload = (props: TaskActionUploadProps) => {
    const handleSubmit = () => {

    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                UPLOAD
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload a File to the Module" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"}>
                <FileInput source="file" accept="application/pdf" fullWidth label="project.fields.waive_file_upload" labelSingle="project.fields.waiver_file" helperText=" ">
                    <FileField source="src" title="title" download={true} />
                </FileInput>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionUpload;

