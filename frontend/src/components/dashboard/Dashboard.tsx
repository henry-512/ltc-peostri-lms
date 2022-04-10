import { Title } from "react-admin";
import DashboardWrapper from "./DashboardWrapper";
import { ProjectCount, TaskCount } from "./widgets";

const Spacer = () => <span style={{ width: '1em' }} />;
const VerticalSpacer = () => <span style={{ height: '1em' }} />;

export interface DashboardProps {
}

const Dashboard = (props: DashboardProps) => {
    return (
        <>
            <Title>LMS Dashboard</Title>
            <DashboardWrapper>
                <ProjectCount count={21} />
                <Spacer />
                <TaskCount count={32} />
                <Spacer />
            </DashboardWrapper>
        </>
    )
}

export default Dashboard;