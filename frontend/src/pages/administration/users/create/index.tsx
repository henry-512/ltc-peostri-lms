import { Create, SimpleForm, useTranslate } from "react-admin";
import UserFields from "src/components/UserFields";
import UserToolbar from "src/components/UserToolbar";
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
                mode="onBlur"
                warnWhenUnsavedChanges
            >
                <UserFields />
            </SimpleForm>
        </Create>
    );
};

export default UserCreate