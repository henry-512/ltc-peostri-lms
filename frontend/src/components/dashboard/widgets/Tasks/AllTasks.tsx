import TaskList from "./TaskList";

export type AllTasksProps = {
    
}

const AllTasks = (props: AllTasksProps) => {
    return (
        <TaskList resource="tasks/all" title="dashboard.widget.tasks.all_title" />
    )
}

export default AllTasks;