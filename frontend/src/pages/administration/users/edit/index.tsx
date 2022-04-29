import { Edit, SimpleForm } from "react-admin";
import UserEditTitle from "src/components/UserEditTitle";
import UserEditToolbar from "src/components/UserEditToolbar";
import UserFields from "src/components/UserFields";
import UserToolbar from "src/components/UserToolbar";
import transformer from "../transformer";
import validateUser from "../validation";

const UserEdit = (props: any) => (
    <Edit {...props} transform={transformer} actions={<UserEditToolbar />} title={<UserEditTitle />} redirect="edit">
        <SimpleForm
            validate={validateUser}
            toolbar={
                <UserToolbar
                    create={false}
                />
            }
            defaultValues={{
                useEmail: (props.defaultValues && props.defaultValues.email === props.defaultValues.username) ? true : false,
                teams: []
            }}
            mode="onBlur"
            warnWhenUnsavedChanges
        >
            <UserFields />
        </SimpleForm>
    </Edit>
)

export default UserEdit;