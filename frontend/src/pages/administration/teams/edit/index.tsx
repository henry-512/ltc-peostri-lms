import { Box } from "@material-ui/core";
import { AutocompleteArrayInput, Edit, ReferenceArrayInput, SimpleForm, TextInput } from "react-admin";
import { SectionTitle } from "src/components/misc";
import TeamToolbar from "src/components/teams/TeamToolbar";
import transformer from "../transformer";
import validateTeam from "../validation";

const TeamEdit = (props: any) => (
    <Edit {...props} transform={transformer} title='team.layout.editing'>
        <SimpleForm
            validate={validateTeam}
            toolbar={
                <TeamToolbar
                    create={false}
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
    </Edit>
)

export default TeamEdit;