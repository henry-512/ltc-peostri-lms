import CardWithIcon from "./base/CardWithIcon"
import ListAltIcon from '@material-ui/icons/ListAlt';
import { ITask } from "src/util/types";
import { Box, List, Typography } from "@material-ui/core";

export type TaskItemProps = {
    name: string
}

export const TaskItem = (props: TaskItemProps) => (
    <>
        <Box display="flex">
            <Typography>
                {props.name}
            </Typography>
        </Box>
    </>
)

export type TaskWidgetProps = {
    title?: string
    count: number
    children?: JSX.Element | JSX.Element[]
    data?: ITask[];
}

const TaskWidget = (props: TaskWidgetProps) => {
    return (
        <CardWithIcon icon={ListAltIcon} to={"/users/tasks/list"} title={props.title || "dashboard.widget.task_count.title"} subtitle={props.count}>
            {(props.data) ? (
                <>
                    <List>
                        {
                            props.data.map((task, index) => (
                                <TaskItem name={task.title} key={index} />
                            ))
                        }
                    </List>
                </>
            ) : (
                props.children
            )}
        </CardWithIcon>
    )
}

export default TaskWidget;