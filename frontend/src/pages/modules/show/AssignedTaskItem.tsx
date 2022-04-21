import { Button, Box, Typography } from "@mui/material";
import { useState } from "react";
import { ReferenceArrayField } from "react-admin";
import AvatarGroupField from "src/components/users/AvatarGroupField";
import { dateFormatToString } from "src/util/dateFormatter";
import { getProgressStatusColor } from "src/util/getProgressStatus";
import { ITask } from "src/util/types";
import TaskActionUpload from "./TaskActionUpload";

export type AssignedTaskActionProps = {
    id: string
    type?: string
}

const AssignedTaskAction = ({ id, type }: AssignedTaskActionProps) => {
    const [open, setOpen] = useState<string>("");

    switch (type) {
        case 'DOCUMENT_UPLOAD':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_REVIEW':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_REVISE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'WAIVER_APPROVE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_APPROVE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        default:
            return null
    }
}

export type AssignedTaskItemProps = {
    record: ITask
}

const AssignedTaskItem = ({ record }: AssignedTaskItemProps) => (
    <Box display="flex" justifyContent="space-between" gap="10px" alignItems="center">
        <Box display="flex" alignItems="center" gap="20px">
            <Box borderRadius="50%" width="12px" height="12px" sx={{
                backgroundColor: (getProgressStatusColor(record.suspense))
            }}></Box>
            <Box display="flex" flexDirection="column">
                <Typography>{record.title}</Typography>
                <Box>
                    <Typography variant="caption">Suspense: {dateFormatToString(record.suspense)}</Typography>
                    <Typography variant="caption"> - {record.status}</Typography>
                </Box>
                <ReferenceArrayField record={record} reference="admin/users" source="users">
                    <AvatarGroupField height={24} width={24} fontSize="14px" max={6} color='blue' />
                </ReferenceArrayField>
            </Box>
        </Box>
        <AssignedTaskAction id={`${record.id}`} type={record.type} />
    </Box>
)

export default AssignedTaskItem;