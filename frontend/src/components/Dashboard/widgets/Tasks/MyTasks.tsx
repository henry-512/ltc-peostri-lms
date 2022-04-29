/**
* @file Dashboard My Tasks Widgets
* @module MyTasksWidget
* @category Dashboard
* @author Braden Cariaga
*/

import TaskList from "./TaskList";

const MyTasks = () => {
    return (
        <TaskList resource="tasks/assigned" filter={{ status: "IN_PROGRESS" }} title="dashboard.widget.tasks.my_title" />
    )
}

export default MyTasks;