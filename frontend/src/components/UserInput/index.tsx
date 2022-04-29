/**
* @file User Input used on the admin teams edit and create.
* @module UserInput
* @category UserInput
* @author Braden Cariaga
*/

import { AutocompleteArrayInput, ReferenceArrayInput } from "react-admin";
import { useWatch } from "react-hook-form";

/**
 * User Input used on the admin teams edit and create.
 */
const UserInput = () => {
    const team = useWatch({ name: "team", defaultValue: "", exact: true })

    return (
        <>
            <ReferenceArrayInput
                label="project.fields.member"
                reference="admin/users"
                source="users"
                filter={(team) ? { teams: team } : undefined}
            >
                <AutocompleteArrayInput
                    optionText={choice => `${choice.firstName} ${choice.lastName} (${choice.id.substring(0, 4)})`}
                    optionValue="id"
                    helperText=" "
                    fullWidth
                />
            </ReferenceArrayInput>
        </>
    )
}

export default UserInput