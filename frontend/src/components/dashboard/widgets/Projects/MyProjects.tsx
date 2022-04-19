import ProjectList from "./ProjectList";

export type MyProjectsProps = {
    
}

const MyProjects = (props: MyProjectsProps) => {
    return (
        <ProjectList resource="projects/assigned" title="dashboard.widget.projects.my_title" />
    )
}

export default MyProjects;