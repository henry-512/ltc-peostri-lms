import CardWithIcon from "./CardWithIcon"
import ListAltIcon from '@material-ui/icons/ListAlt';

export type ProjectCountProps = {
    title?: string
    count: number
}

const ProjectCount = (props: ProjectCountProps) => {
    return (
        <CardWithIcon icon={ListAltIcon} to={"/users/projects/list"} title={props.title || "dashboard.widget.project_count.title"} subtitle={props.count} />
    )
}

export default ProjectCount;