import { EditActionsProps, ShowButton, TopToolbar } from "react-admin";

const UserEditToolbar = ({ data, resource }: EditActionsProps) => (
    <TopToolbar>
        <ShowButton record={data} />
    </TopToolbar>
)

export default UserEditToolbar;