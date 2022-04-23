/**
* @file Review task action renders the button and dialogs for an review task.
* @module TaskActionReview
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useRefresh, useUpdate, FileField, FileInput } from "react-admin";
import { Button, Typography } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';

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

    /**
     * If the data object is empty, then call the update function with the first argument, and if the
     * data object is not empty, then call the update function with the second argument.
     * @param {any} data - {
     */
    const handleSubmit = (data: any) => {
        if (!data || (data && !data.file)) {
            update(`proceeding/tasks/complete`, { id: props.id, data, previousData: {} }).then(() => refresh()).finally(() => props.close())
        } else {
            //update(`proceeding/tasks/upload`, { id: props.id, data, previousData: {} }).finally(() => props.close())       
        }
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
                Review
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Review Uploaded Documents" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"} submitIcon={<AddBoxIcon />} allowEmptySubmit>
                <Typography>Please review this document: <FileField source="file.latest" title="title" download={true} /></Typography>
                <Typography>If you have any revision comments, please upload them here:</Typography>
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

