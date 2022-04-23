import Dashboard from "src/components/Dashboard";

const DashboardPage = () => {
    let permission = "";

    switch (permission) {
        case 'something':
            return (<></>)
        default:
            return (<Dashboard />)
    }
}

export default DashboardPage;