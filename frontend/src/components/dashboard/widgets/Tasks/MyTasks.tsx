import TaskList from "./TaskList";

export type MyTasksProps = {
    
}

const MyTasks = (props: MyTasksProps) => {
    return (
        <TaskList resource="projects/assigned" title="dashboard.widget.tasks.my_title" />
    )
}

export default MyTasks;