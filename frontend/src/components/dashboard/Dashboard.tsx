import DashboardWrapper from "./DashboardWrapper";
import { ProjectCount, TaskCount } from "./widgets";

type DashboardWrapperProps = {
    children: JSX.Element[]
}

const Dashboard = (props: DashboardWrapperProps) => {
    return (
        <DashboardWrapper>
            <ProjectCount count={0} />
            <TaskCount count={0} />
        </DashboardWrapper>
    )
}

export default Dashboard;