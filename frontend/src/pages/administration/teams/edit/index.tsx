/**
* @file Administration Team Edit file.
* @module AdministrationTeamEdit
* @category AdministrationTeamPage
* @author Braden Cariaga
*/


import { Box } from "@mui/material";
import { AutocompleteArrayInput, Edit, ReferenceArrayInput, SimpleForm, TextInput } from "react-admin";
import SectionTitle from "src/components/SectionTitle";
import TeamToolbar from "src/components/TeamToolbar";
import transformer from "../transformer";
import validateTeam from "../validation";

const TeamEdit = (props: any) => (
    <Edit {...props} transform={transformer} title='team.layout.editing' redirect="edit">
        <SimpleForm
            validate={validateTeam}
            toolbar={
                <TeamToolbar
                    create={false}
                />
            }
            mode="onBlur"
            warnWhenUnsavedChanges
        >
            <Box display="flex" width="calc(50% - 16px)" flexDirection="column">
                <SectionTitle label="team.layout.general" />
                <TextInput source="name" fullWidth/>
                <ReferenceArrayInput reference="admin/users" source="users">
                    <AutocompleteArrayInput 
                        optionText={choice => `${choice.firstName} ${choice.lastName} (${choice.id.substring(0, 4)})`} 
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