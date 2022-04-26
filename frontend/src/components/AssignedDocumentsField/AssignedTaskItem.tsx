/**
* @file Task item component
* @module AssignedTaskItem
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { Box, Button, Typography } from "@mui/material";
import { ReferenceField, FunctionField, useUpdate } from "react-admin";
import { dateFormatToString } from "src/util/dateFormatter";
import { getProgressStatusColor } from "src/util/getProgressStatus";
import { ITask } from "src/util/types";
import AvatarField from "../AvatarField";
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useState } from "react";
import DocumentViewer from "../DocumentViewer";

export type AssignedTaskItemProps = {
    record: ITask
    id: string
}

/**
 * Task item component
 * @param {AssignedTaskItemProps} props - AssignedTaskItemProps
 */
const AssignedTaskItem = ({ record, id }: AssignedTaskItemProps) => {
    const [viewed, setViewed] = useState(false);
    const [documentOpen, setDocumentOpen] = useState(false);
    const [update, { isLoading, error }] = useUpdate();

    const openDocument = () => {
        setViewed(true); 
        setDocumentOpen(true);
        update(`proceeding/tasks/revise`, { id: id, data: { review: record.id }, previousData: {} });
    }

    return (
        <Box display="flex" justifyContent="space-between" gap="10px" alignItems="center">
            <Box display="flex" alignItems="center" gap="20px" justifyContent="space-between">
                { (viewed) ? <CheckCircleOutlineIcon color="success" /> : <RadioButtonUncheckedIcon color="error" /> }
                <Box display="flex" flexDirection="column">
                    <Typography>{record.title}</Typography>
                    <Box>
                        <Typography variant="caption">Uploaded: {dateFormatToString(record.createdAt, true)}</Typography>
                    </Box>
                </Box>
            </Box>
            <ReferenceField record={record} reference="admin/users" source="author" link={false}>
                <FunctionField render={(record: any) => (
                    <Box display="flex" flexDirection="column" gap="2px">
                        <Typography>Reviewer:</Typography>
                        <Box display="flex" gap="8px">
                            <AvatarField />
                            <Typography>{record.firstName} {record.lastName}</Typography>
                        </Box>
                    </Box>
                )} />
            </ReferenceField>
            <Button variant="outlined" onClick={openDocument}>
                View
            </Button>
            <DocumentViewer open={documentOpen} handleClose={() => setDocumentOpen(false)} ariaLabel={"revision-doc-viewer-"+record.id} label={`Viewing Document: ${record.title}`} src={record.src} maxWidth="md" />
        </Box>
    )
}

export default AssignedTaskItem;