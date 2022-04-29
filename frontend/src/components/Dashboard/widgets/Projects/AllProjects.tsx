/**
* @file Dashboard All Projects Widgets
* @module AllProjectsWidget
* @category Dashboard
* @author Braden Cariaga
*/

import ProjectList from "./ProjectList";

const AllProjects = () => (
    <ProjectList resource="projects/all" filter={{ status: "IN_PROGRESS" }} title="dashboard.widget.projects.all_title" />
)


export default AllProjects;