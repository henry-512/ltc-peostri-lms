/**
* @file Main assigned documents field component
* @module AssignedDocumentsField
* @category AssignedDocumentsField
* @author Braden Cariaga
*/

import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { ITask } from "src/util/types";
import AssignedTaskItem from "./AssignedTaskItem";

export type AssignedDocumentsFieldProps = {
    data: []
    taskID: string
}

/**
 * Main assigned documents field component
 */
const AssignedDocumentsField = ({ data, taskID }: AssignedDocumentsFieldProps) => {
    /* Checking if the data is empty or not. If it is empty, it will return null. */
    if (!data) return null;

    /* Checking if the data is empty or not. If it is empty, it will return null. */
    if (data && data.length < 1) return null

    return (
        <>
            <Box>
                <Typography variant="h6" mb="-12px">
                    Unviewed Revisions:
                </Typography>
                <List>
                    {data.map((file: any, index: number) => (
                        <ListItem
                            key={file.id}
                            alignItems="flex-start"
                            sx={{
                                padding: '0'
                            }}
                        >
                            <ListItemText
                                primary={<AssignedTaskItem record={file} id={taskID} />}
                                sx={{
                                    overflowY: 'hidden',
                                    height: 'auto',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    padding: (theme) => theme.spacing(1),
                                    border: (theme) => `1px solid ${theme.palette.borderColor?.main}`,
                                    borderRadius: '10px'
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </>
    )
}

export default AssignedDocumentsField;