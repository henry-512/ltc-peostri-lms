import CardWithIcon from "./base/CardWithIcon"
import { ITask } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { LinearProgress, useCreatePath, useGetList, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';

export type TaskWidgetProps = {
    title?: string
}

const MyTasks = (props: TaskWidgetProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();
    
    const { data: tasks, total, isLoading } = useGetList<ITask>('tasks', {
        filter: {},
        sort: { field: 'read', order: 'DESC' },
        pagination: { page: 1, perPage: 8 },
    });

    const display = isLoading ? 'none' : 'block';

    return (
        <CardWithIcon icon={TaskAltIcon} to={createPath({ resource: `tasks`, type: 'list' })} title={props.title || "dashboard.widget.my_tasks.title"} subtitle={total || 0}>
            {(tasks) ? (
                <List sx={{ display }}>
                    {tasks?.map((record: ITask) => (
                        <ListItem
                            key={record.id}
                            button
                            component={Link}
                            to={createPath({ resource: `tasks`, id: record.id, type: 'show' })}
                            replace={true}
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={record.title}
                                secondary={record.type}
                                sx={{
                                    overflowY: 'hidden',
                                    height: '4em',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    paddingRight: 0,
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                (isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : null
            )}
            <Divider />
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to={createPath({ resource: `tasks`, type: 'list' })}
                size="small"
                color="primary"
                replace={true}
            >
                <Box p={1} sx={{ color: 'primary.main' }}>
                    {translate('dashboard.widget.my_tasks.all')}
                </Box>
            </Button>
        </CardWithIcon>
    )
}

export default MyTasks;