import TaskList from "./TaskList";

export type TeamTasksProps = {
    
}

const TeamTasks = (props: TeamTasksProps) => {
    return (
        <TaskList resource="tasks/team" title="dashboard.widget.tasks.team_title" />
    )
}

export default TeamTasks;