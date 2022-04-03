import CardWithIcon from "./CardWithIcon"
import ListAltIcon from '@material-ui/icons/ListAlt';

type TaskCountProps = {
    title?: string
    count: number
}

const TaskCount = (props: TaskCountProps) => {
    return (
        <CardWithIcon icon={ListAltIcon} to={"/users/tasks/list"} title={props.title || "dashboard.widget.task_count.title"} subtitle={props.count} />
    )
}

export default TaskCount;