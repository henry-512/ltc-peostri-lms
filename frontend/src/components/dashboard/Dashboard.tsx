import { Title } from "react-admin";
import DashboardWrapper from "./DashboardWrapper";
import { MyProjects, TaskCount } from "./widgets";
import MyNotifications from "./widgets/MyNotifications";

const Spacer = () => <span style={{ width: '1em' }} />;
const VerticalSpacer = () => <span style={{ height: '1em' }} />;

export type DashboardProps = {
}

const Dashboard = (props: DashboardProps) => {
    return (
        <>
            <Title>LMS Dashboard</Title>
            <DashboardWrapper>
                <MyProjects />
                <Spacer />
                <TaskCount count={32} />
                <Spacer />
                <MyNotifications />
            </DashboardWrapper>
        </>
    )
}

export default Dashboard;