import { Edit, SimpleForm } from "react-admin";
import { UserEditTitle, UserEditToolbar, UserFields, UserToolbar } from "src/components/users";
import transformer from "../transformer";
import validateUser from "../validation";

const UserEdit = (props: any) => (
    <Edit {...props} transform={transformer} actions={<UserEditToolbar />} title={<UserEditTitle />}>
        <SimpleForm
            validate={validateUser}
            toolbar={
                <UserToolbar
                    create={false}
                />
            }
            initialValues={{
                useEmail: (props.initialValues && props.initialValues.email === props.initialValues.username) ? true : false
            }}
        >
            <UserFields />
        </SimpleForm>
    </Edit>
)

export default UserEdit;