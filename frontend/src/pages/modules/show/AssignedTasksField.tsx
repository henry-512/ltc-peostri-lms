import { Box, Typography, List, ListItem, ListItemText } from "@mui/material";
import { useCreatePath, useListContext, useShowContext } from "react-admin";
import { Link } from "react-router-dom";
import { ITask } from "src/util/types";
import AssignedTaskItem from "./AssignedTaskItem";
import TaskGrid from "./TaskGrid";

type AssignedTasksFieldProps = {

}

const AssignedTasksField = (props: any) => {
    const {
        defaultTitle, // the translated title based on the resource, e.g. 'Post #123'
        error,  // error returned by dataProvider when it failed to fetch the record. Useful if you want to adapt the view instead of just showing a notification using the `onError` side effect.
        isFetching, // boolean that is true while the record is being fetched, and false once the record is fetched
        isLoading, // boolean that is true until the record is available for the first time
        record, // record fetched via dataProvider.getOne() based on the id from the location
        refetch, // callback to refetch the record via dataProvider.getOne()
        resource, // the resource name, deduced from the location. e.g. 'posts'
    } = useShowContext();

    const {
        data
    } = useListContext();

    const createPath = useCreatePath();

    if (!data) return null;

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
                            button
                            component={Link}
                            to={createPath({ resource: `tasks`, id: task.id, type: 'show' })}
                            replace={true}
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={<AssignedTaskItem record={task} />}
                                sx={{
                                    overflowY: 'hidden',
                                    height: 'auto',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    paddingRight: 0,
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