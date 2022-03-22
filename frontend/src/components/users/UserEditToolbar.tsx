import { EditActionsProps, ShowButton, TopToolbar } from "react-admin";

const UserEditToolbar = ({ basePath, data, resource }: EditActionsProps) => (
    <TopToolbar>
        <ShowButton basePath={basePath} record={data} />
    </TopToolbar>
)

export default UserEditToolbar;