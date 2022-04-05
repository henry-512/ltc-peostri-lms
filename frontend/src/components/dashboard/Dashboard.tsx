import { Title } from "react-admin";
import DashboardWrapper from "./DashboardWrapper";
import { ProjectCount, TaskCount } from "./widgets";

export type DashboardProps = {
}

const Dashboard = (props: DashboardProps) => {
    return (
        <>
            <Title>LMS Dashboard</Title>
            <DashboardWrapper>
                <ProjectCount count={0} />
                <TaskCount count={0} />
            </DashboardWrapper>
        </>
    )
}

export default Dashboard;