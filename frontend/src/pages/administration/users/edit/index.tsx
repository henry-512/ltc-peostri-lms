import { Edit, SimpleForm } from "react-admin";
import { UserEditTitle, UserEditToolbar, UserFields, UserToolbar } from "src/components/users";
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
                useEmail: (props.defaultValues && props.defaultValues.email === props.defaultValues.username) ? true : false
            }}
        >
            <UserFields />
        </SimpleForm>
    </Edit>
)

export default UserEdit;