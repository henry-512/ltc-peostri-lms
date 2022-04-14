import { Create, SimpleForm, useTranslate } from "react-admin";
import { UserFields, UserToolbar } from "src/components/users";
import transformer from "../transformer";
import validateUser from "../validation";

const UserCreate = (props: any) => {
    const translate = useTranslate();
    
    return (
        <Create {...props} transform={transformer} title={translate('user.layout.create_title')} redirect="list">
            <SimpleForm
                validate={validateUser}
                toolbar={
                    <UserToolbar
                        create={true}
                    />
                }
                defaultValues={{
                    useEmail: true
                }}
            >
                <UserFields />
            </SimpleForm>
        </Create>
    );
};

export default UserCreate