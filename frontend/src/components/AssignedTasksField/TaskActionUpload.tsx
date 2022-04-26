/**
* @file Upload task action renders the button and dialogs for an upload task.
* @module TaskActionUpload
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useDataProvider, useNotify, useUpdate, FileField, FileInput, useRefresh, useShowContext, useRecordContext } from "react-admin";
import { styled } from '@mui/material/styles';
import { Button } from "@mui/material";
import TaskActionDialog from "./TaskActionDialog";
import { MouseEventHandler, useEffect, useState } from "react";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AssignedDocumentsField from "../AssignedDocumentsField";

export type TaskActionUploadProps = {
    id: string
    open: boolean
    close: Function
    setOpen: MouseEventHandler<HTMLButtonElement>
    record: any
}

/**
 * Upload task action renders the button and dialogs for an upload task.
 * @param {TaskActionUploadProps} props - TaskActionUploadProps
 */
const TaskActionUpload = (props: TaskActionUploadProps) => {
    const [update, { isLoading, error }] = useUpdate();
    const refresh = useRefresh();
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const task = useRecordContext(props);
    let { record } = useShowContext();

    const [files, setFiles] = useState(record?.files);

    useEffect(() => {
        if (!files && record.modules) {
            dataProvider.getOne('modules', { id: props.record.module })
            .then(({data}) => setFiles(data.files));
        }
    }, [record, task]);

    if (!record || !task) return null;

    const handleSubmit = (data: any) => {
        update(`proceeding/tasks/upload`, { id: props.id, data, previousData: {} }, {
            onSuccess: (data) => {
                refresh();
                notify('Uploaded document.');
            },
            onError: (error: any) => {
                notify(`Document upload error: ${error.message}`, { type: 'warning' });
            },
        }).finally(() => props.close()); 
    }

    const handleClose = () => {
        props.close()
    }

    return (
        <>
            <Button variant="outlined" onClick={props.setOpen}>
                UPLOAD
            </Button>
            <TaskActionDialog ariaLabel="document_upload_dialog" label="Upload a File to the Module" open={props.open} handleSubmit={handleSubmit} handleClose={handleClose} submitText={"Upload"} submitIcon={<UploadFileIcon />}>
                { (!files || (!files.reviews && files.reviews?.length < 1)) ? <></> : <AssignedDocumentsField data={files.reviews} taskID={String(task.id)} /> }
                
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

