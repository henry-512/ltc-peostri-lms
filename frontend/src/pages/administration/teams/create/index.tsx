import { Create, SimpleForm, useTranslate } from "react-admin";
import { UserFields, UserToolbar } from "src/components/users";
import transformer from "../transformer";
import validateUser from "../validation";

const TeamCreate = (props: any) => {
    const translate = useTranslate();
    
    return (
        <Create {...props} transform={transformer} title={translate('user.layout.create_title')}>
            <SimpleForm
                validate={validateUser}
                toolbar={
                    <UserToolbar
                        create={true}
                    />
                }
                initialValues={{
                    useEmail: true
                }}
            >
                <UserFields />
            </SimpleForm>
        </Create>
    );
};

export default TeamCreate