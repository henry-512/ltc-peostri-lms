import { Box, Typography } from "@mui/material";
import { display } from "@mui/system";
import { ReferenceArrayField, ReferenceField, TextField } from "react-admin";
import AvatarGroupField from "src/components/users/AvatarGroupField";
import { dateFormatToString } from "src/util/dateFormatter";
import { getProgressStatusColor } from "src/util/getProgressStatus";
import { IProject } from "src/util/types";

export type ProjectListItemProps = {
    record: IProject
}

const ProjectListItem = ({ record }: ProjectListItemProps) => (
    <Box display="flex" alignItems="center" gap="10px">
        <Box borderRadius="50%" width="12px" height="12px" sx={{
            backgroundColor: (getProgressStatusColor(record.suspense))
        }}></Box>
        <Box display="flex" flexDirection="column">
            <Typography>{record.title}</Typography>
            <Box>
                <Typography variant="caption">({dateFormatToString(record.start)} - {dateFormatToString(record.suspense)})</Typography>
                <Typography variant="caption"> - {record.status}</Typography>
            </Box>
            <Box>
                <Typography variant="caption">Team: </Typography>
                <ReferenceField record={record} reference="admin/teams" source="team">
                    <TextField variant="caption" source="name" />
                </ReferenceField>
            </Box>
            <ReferenceArrayField record={record} reference="admin/users" source="users">
                <AvatarGroupField height={24} width={24} fontSize="14px" max={6} color='blue' />
            </ReferenceArrayField>
            {/* Add this once value is cached on Backend and sent <LinearProgress variant="determinate" value={calculateProjectProgress()} /> */}
        </Box>
    </Box>
)

export default ProjectListItem;