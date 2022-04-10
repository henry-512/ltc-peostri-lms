import { Box } from "@material-ui/core";
import { AutocompleteArrayInput, Create, ReferenceArrayInput, SimpleForm, TextInput, useTranslate } from "react-admin";
import { SectionTitle } from "src/components/misc";
import TeamToolbar from "src/components/teams/TeamToolbar";
import transformer from "../transformer";
import validateTeam from "../validation";

const TeamCreate = (props: any) => {
    const translate = useTranslate();
    
    return (
        <Create {...props} transform={transformer} title={translate('user.layout.create_title')}>
            <SimpleForm
                validate={validateTeam}
                toolbar={
                    <TeamToolbar
                        create={true}
                    />
                }
            >
                <Box display="flex" width="calc(50% - 16px)" flexDirection="column">
                    <SectionTitle label="team.layout.general" />
                    <TextInput source="name" fullWidth/>
                    <ReferenceArrayInput reference="admin/users" source="users">
                        <AutocompleteArrayInput 
                            optionText={choice => `${choice.firstName} ${choice.lastName}`} 
                            optionValue="id" 
                            source="users"
                            fullWidth
                        />
                    </ReferenceArrayInput>
                </Box>
            </SimpleForm>
        </Create>
    );
};

export default TeamCreate