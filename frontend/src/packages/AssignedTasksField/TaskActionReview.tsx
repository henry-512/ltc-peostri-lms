import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useNotify, useUpdate, FileField, FileInput, useRecordContext } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';

export type TaskActionReviewProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

const TaskActionReview = (props: TaskActionReviewProps) => {
    const [update, { isLoading, error }] = useUpdate();

    const handleSubmit = (data: any) => {
        if (!data || (data && !data.file)) {
            update(`proceeding/tasks/complete`, { id: props.id, data, previousData: {} }).finally(() => props.close())
        } else {
            //update(`proceeding/tasks/upload`, { id: props.id, data, previousData: {} }).finally(() => props.close())       
        }
    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                Review
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Review Uploaded Documents" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"} submitIcon={<AddBoxIcon />} allowEmptySubmit>
                <Typography>Please review this document: <FileField source="file.latest" title="title" download={true} /></Typography>
                <Typography>If you have any revision comments, please upload them here:</Typography>
                <FileInput source="file" accept="application/pdf" fullWidth label=" " labelSingle="project.fields.waiver_file" helperText=" ">
                    <FileField source="src" title="title" download={true} />
                </FileInput>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionReview;

