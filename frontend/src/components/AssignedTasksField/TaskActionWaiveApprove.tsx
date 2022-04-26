/**
* @file Waive approve task action renders the button and dialogs for a waiver approval task.
* @module TaskActionWaiveApprove
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useRefresh, useUpdate, FileField, FileInput } from "react-admin";
import { Button } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler } from "react";
import AddBoxIcon from '@mui/icons-material/AddBox';

export type TaskActionWaiveApproveProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
    record: any
}

/**
 * Waive approve task action renders the button and dialogs for a waiver approval task.
 * @param {TaskActionWaiveApproveProps} props - TaskActionWaiveApproveProps
 */
const TaskActionWaiveApprove = (props: TaskActionWaiveApproveProps) => {
    const [update, { isLoading, error }] = useUpdate();
    const refresh = useRefresh();

    /**
     * HandleSubmit is a function that takes a parameter of type any and returns nothing. It calls the
     * update function, which returns a promise, and then calls the refresh function, which returns
     * nothing, and then calls the close function, which returns nothing.
     * @param {any} data - the data that is being submitted
     */
    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/approve`, { id: props.id, data, previousData: {} }).then(() => refresh()).finally(() => props.close())        
    }

    /**
     * The handleClose function is a function that takes no arguments and returns nothing. It calls the
     * close function that is passed in as a prop.
     */
    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                Waive
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Are you sure you want to waive this?" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Waive"} submitIcon={<AddBoxIcon />}>
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

export default TaskActionWaiveApprove;

