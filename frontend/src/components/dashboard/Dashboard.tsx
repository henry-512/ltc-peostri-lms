import { Box } from "@mui/material";
import { Title } from "react-admin";
import DashboardWrapper from "./DashboardWrapper";
import { MyProjects, MyTasks, MyNotifications, WelcomeMessage } from "./widgets";

const Spacer = () => <span style={{ width: '1em' }} />;
const VerticalSpacer = () => <span style={{ height: '1em' }} />;

export type DashboardProps = {
}

const Dashboard = (props: DashboardProps) => {
    return (
        <>
            <Title>LMS Dashboard</Title>
            <WelcomeMessage />
            <DashboardWrapper>
                <Box flex="1" display="flex" flexDirection="column">
                    <MyProjects />
                </Box>
                <Spacer />
                <Box flex="1" display="flex" flexDirection="column">
                    <MyTasks />
                </Box>
                <Spacer />
                <Box flex="1" display="flex" flexDirection="column">
                    <MyNotifications />
                </Box>
                <Spacer />
                <Box flex="1" display="flex" flexDirection="column">
                    <MyTasks />
                </Box>
            </DashboardWrapper>
        </>
    )
}

export default Dashboard;