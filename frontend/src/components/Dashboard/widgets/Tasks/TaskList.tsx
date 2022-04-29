/**
* @file Dashboard Tasks Widget List
* @module TasksWidgetList
* @category Dashboard
* @author Braden Cariaga
*/

import CardWithIcon from "../base/CardWithIcon"
import { ITask } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText } from "@mui/material";
import { LinearProgress, SortPayload, useCreatePath, useGetList, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TaskListItem from "./TaskListItem";
import TaskEmpty from "./TaskEmpty";
import { AnyNsRecord } from "dns";
import { useEffect } from "react";

export type TaskListProps = {
    title?: string
    resource?: string
    filter?: any
    sort?: SortPayload
    showCount?: number
}

const TaskList = (props: TaskListProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();
    
    const { data: tasks, total, isLoading, isError } = useGetList<ITask>(props.resource || 'tasks', {
        filter: props.filter || {},
        sort: props.sort || { field: 'suspense', order: 'ASC' },
        pagination: { page: 1, perPage: props.showCount || 8 },
    });

    const display = isLoading ? 'none' : 'block';

    if (isError) return null;
    if (isLoading) return null;

    return (
        //@ts-ignore
        <CardWithIcon icon={TaskAltIcon} to={createPath({ resource: `tasks`, type: 'list' })} title={props.title || "dashboard.widget.tasks.my_title"} subtitle={(isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : (total || "0")}>
            {(tasks && tasks.length > 0) ? (
                <>
                    <List sx={{ display }}>
                        {tasks?.map((record: ITask) => (
                            <ListItem
                                key={record.id}
                                button
                                component={Link}
                                to={createPath({ resource: `modules`, id: record.module, type: 'show' })}
                                replace={true}
                                alignItems="flex-start"
                                sx={{
                                    transition: 'all .2s',
                                    color: (theme) => theme.palette.primary.main,
                                    '&:hover': {
                                        backgroundColor: (theme) => theme.palette?.borderColor?.main,
                                        transition: 'all .2s'
                                    }
                                }}
                            >
                                <ListItemText
                                    primary={<TaskListItem record={record} />}
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
                    <Divider />
                    <Button
                        sx={{ borderRadius: 0 }}
                        component={Link}
                        to={createPath({ resource: props.resource || `tasks`, type: 'list' })}
                        size="small"
                        color="primary"
                        replace={true}
                        disabled={(!tasks) ? true : false}
                    >
                        <Box p={1} sx={{ color: 'primary.main' }}>
                            {translate('dashboard.widget.tasks.all')}
                        </Box>
                    </Button>
                </>
            ) : null }
        </CardWithIcon>
    )
}

export default TaskList;