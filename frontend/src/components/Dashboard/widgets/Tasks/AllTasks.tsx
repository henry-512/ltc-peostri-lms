/**
* @file Dashboard All Tasks Widgets
* @module AllTasksWidget
* @category Dashboard
* @author Braden Cariaga
*/

import TaskList from "./TaskList";

const AllTasks = () => {
    return (
        <TaskList resource="tasks/all" filter={{ status: "IN_PROGRESS" }} title="dashboard.widget.tasks.all_title" />
    )
}

export default AllTasks;