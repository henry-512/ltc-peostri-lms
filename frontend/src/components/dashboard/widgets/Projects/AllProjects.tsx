import ProjectList from "./ProjectList";

export type AllProjectsProps = {
    
}

const AllProjects = (props: AllProjectsProps) => (
    <ProjectList resource="projects/all" title="dashboard.widget.projects.all_title" />
)


export default AllProjects;