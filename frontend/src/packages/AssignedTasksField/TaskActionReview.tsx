import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useNotify, useUpdate, FileField, FileInput, useRecordContext } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";

export type TaskActionReviewProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

const TaskActionReview = (props: TaskActionReviewProps) => {
    const [update, { isLoading, error }] = useUpdate();

    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/upload`, { id: props.id, data, previousData: {} }).finally(() => props.close())        
    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                Review
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload a File to the Module" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"}>
                <FileInput source="file" accept="application/pdf" fullWidth label="project.fields.waive_file_upload" labelSingle="project.fields.waiver_file" helperText=" ">
                    <FileField source="src" title="title" download={true} />
                </FileInput>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionReview;

