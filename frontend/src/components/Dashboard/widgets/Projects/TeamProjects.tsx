/**
* @file Dashboard Team Projects Widgets
* @module TeamProjectsWidget
* @category Dashboard
* @author Braden Cariaga
*/

import ProjectList from "./ProjectList";

const TeamProjects = () => {
    return (
        <ProjectList resource="projects/team" filter={{ status: "IN_PROGRESS" }} title="dashboard.widget.projects.team_title" />
    )
}

export default TeamProjects;