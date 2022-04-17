import ProjectList from "./ProjectList";

export type TeamProjectsProps = {
    
}

const TeamProjects = (props: TeamProjectsProps) => {
    return (
        <ProjectList resource="projects/team" title="dashboard.widget.projects.team_title" />
    )
}

export default TeamProjects;