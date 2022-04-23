/**
* @file Task item component
* @module AssignedTaskItem
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { Box, Typography } from "@mui/material";
import { ReferenceArrayField } from "react-admin";
import { dateFormatToString } from "src/util/dateFormatter";
import { getProgressStatusColor } from "src/util/getProgressStatus";
import { ITask } from "src/util/types";
import AvatarGroupField from "../AvatarGroupField";
import AssignedTaskAction from "./AssignedTaskAction";

export type AssignedTaskItemProps = {
    record: ITask
}

/**
 * Task item component
 * @param {AssignedTaskItemProps} props
 */
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
            </Box>
        </Box>
        <ReferenceArrayField record={record} reference="admin/users" source="users">
            <AvatarGroupField height={24} width={24} fontSize="14px" max={6} color='blue' />
        </ReferenceArrayField>
        <AssignedTaskAction id={`${record.id}`} type={record.type} />
    </Box>
)

export default AssignedTaskItem;