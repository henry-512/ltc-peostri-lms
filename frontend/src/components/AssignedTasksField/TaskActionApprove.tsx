/**
* @file Approve task action renders the button and dialogs for an approval task.
* @module TaskActionApprove
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useUpdate } from "react-admin";
import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, Button } from "@mui/material";
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

/**
 * Approve task action renders the button and dialogs for an approval task.
 * @param {TaskActionApproveProps} props
 */
const TaskActionApprove = (props: TaskActionApproveProps) => {
    const [update, { isLoading, error }] = useUpdate();

    /**
     * HandleSubmit is a function that takes a parameter of type any and returns nothing.
     * @param {any} data - {
     */
    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/approve`, { id: props.id, data, previousData: {} }).finally(() => props.close())        
    }

    /**
     * The handleClose function is a function that is called when the user clicks the close button. It
     * calls the close function that was passed in as a prop.
     */
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

