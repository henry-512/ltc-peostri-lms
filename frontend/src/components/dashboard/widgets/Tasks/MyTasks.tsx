import TaskList from "./TaskList";

export type MyTasksProps = {
    
}

const MyTasks = (props: MyTasksProps) => {
    return (
        <TaskList resource="tasks" title="dashboard.widget.tasks.my_title" />
    )
}

export default MyTasks;