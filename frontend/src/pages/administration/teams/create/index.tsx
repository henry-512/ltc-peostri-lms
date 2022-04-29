/**
* @file Administration Team Create file.
* @module AdministrationTeamCreate
* @category AdministrationTeamPage
* @author Braden Cariaga
*/

import { Box } from "@mui/material";
import { AutocompleteArrayInput, Create, ReferenceArrayInput, SimpleForm, TextInput, useTranslate } from "react-admin";
import SectionTitle from "src/components/SectionTitle";
import TeamToolbar from "src/components/TeamToolbar";
import transformer from "../transformer";
import validateTeam from "../validation";

const TeamCreate = (props: any) => {
    const translate = useTranslate();
    
    return (
        <Create {...props} transform={transformer} title={translate('user.layout.create_title')} redirect="list">
            <SimpleForm
                validate={validateTeam}
                toolbar={
                    <TeamToolbar
                        create={true}
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
        </Create>
    );
};

export default TeamCreate