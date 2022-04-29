/**
* @file Main dashboard page.
* @module DashboardPage
* @category DashboardPage
* @author Braden Cariaga
*/

import Dashboard from "src/components/Dashboard";

const DashboardPage = () => {
    let permission = "";

    //TODO: Use ranks to change the dashboard component which should render.

    switch (permission) {
        case 'something':
            return (<></>)
        default:
            return (<Dashboard />)
    }
}

export default DashboardPage;