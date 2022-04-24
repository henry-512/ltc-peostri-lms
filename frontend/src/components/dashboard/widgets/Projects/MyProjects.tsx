/**
* @file Dashboard My Projects Widgets
* @module MyProjectsWidget
* @category Dashboard
* @author Braden Cariaga
*/

import ProjectList from "./ProjectList";

const MyProjects = () => {
    return (
        <ProjectList resource="projects/assigned" title="dashboard.widget.projects.my_title" />
    )
}

export default MyProjects;