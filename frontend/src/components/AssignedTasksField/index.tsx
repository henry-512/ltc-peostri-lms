/**
* @file Main assigned task field component
* @module AssignedTasksField
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useListContext } from "react-admin";
import { ITask } from "src/util/types";
import AssignedTaskItem from "./AssignedTaskItem";

/* Main assigned task field component */
const AssignedTasksField = () => {
    const {
        data
    } = useListContext();

    /* Checking if the data is empty or not. If it is empty, it will return null. */
    if (!data) return null;

    /* Checking if the data is empty or not. If it is empty, it will return null. */
    if (data && data.length < 1) return null

    return (
        <>
            <Box>
                <Typography variant="h6">
                    Tasks Needing Your Attention:
                </Typography>
                <List>
                    {data.map((task: ITask, index: number) => (
                        <ListItem
                            key={task.id}
                            alignItems="flex-start"
                            sx={{
                                padding: '0'
                            }}
                        >
                            <ListItemText
                                primary={<AssignedTaskItem record={task} />}
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

export default AssignedTasksField;