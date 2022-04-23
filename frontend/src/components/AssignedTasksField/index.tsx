import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useListContext } from "react-admin";
import { ITask } from "src/util/types";
import AssignedTaskItem from "./AssignedTaskItem";

type AssignedTasksFieldProps = {

}

const AssignedTasksField = (props: AssignedTasksFieldProps) => {
    const {
        data
    } = useListContext();

    if (!data) return null;

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