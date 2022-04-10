import CardWithIcon from "./base/CardWithIcon"
import ListAltIcon from '@material-ui/icons/ListAlt';

export interface ProjectCountProps {
    title?: string
    count: number
    children?: JSX.Element | JSX.Element[]
}

const ProjectCount = (props: ProjectCountProps) => {
    return (
        <CardWithIcon icon={ListAltIcon} to={"/users/projects"} title={props.title || "dashboard.widget.project_count.title"} subtitle={props.count} />
    )
}

export default ProjectCount;