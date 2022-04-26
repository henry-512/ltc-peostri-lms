/**
* @file Main Dashboard File - There should be a file per rank
* @module Dashboard
* @category Dashboard
* @author Braden Cariaga
*/

import { Box } from "@mui/material";
import { Title } from "react-admin";
import { MyProjects, MyTasks, AllTasks, TeamTasks, MyNotifications, WelcomeMessage, AllProjects, TeamProjects } from "./widgets";

/**
 * Horizontal Spacer
 */
const Spacer = () => <span style={{ width: '1em' }} />;
/**
 * Vertical Spacer
 */
const VerticalSpacer = () => <span style={{ height: '1em' }} />;

/**
 * Main Dashboard View
 */
const Dashboard = () => {
    return (
        <>
            <Title>LMS Dashboard</Title>
            <WelcomeMessage />
            <Box display="flex" flexWrap="wrap" justifyContent="flex-start" alignItems="flex-start" >
                <Box flex="1" display="flex" flexDirection="column">
                    <MyNotifications />
                </Box>
                <Spacer />
                <Box flex="1" display="flex" flexDirection="column">
                    <MyTasks />
                    <VerticalSpacer />
                    <TeamTasks />
                    <VerticalSpacer />
                    <AllTasks />
                </Box>
                <Spacer />
                <Box flex="1" display="flex" flexDirection="column">
                    <MyProjects />
                    <VerticalSpacer />
                    <TeamProjects />
                    <VerticalSpacer />
                    <AllProjects />
                </Box>
            </Box>
        </>
    )
}

export default Dashboard;