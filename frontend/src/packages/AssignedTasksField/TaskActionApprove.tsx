import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useNotify, useUpdate, FileField, FileInput, useRecordContext } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';

export type TaskActionApproveProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
}

const TaskActionApprove = (props: TaskActionApproveProps) => {
    const [update, { isLoading, error }] = useUpdate();

    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/approve`, { id: props.id, data, previousData: {} }).finally(() => props.close())        
    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                Approve
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Approve Document" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Approve"} submitIcon={<AddBoxIcon />} maxWidth="xs">
                <Typography>Are you sure you want to approve this?</Typography>
            </TaskActionDialog>
        </>
    );
}

export default TaskActionApprove;

