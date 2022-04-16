import { useEffect } from "react";
import { AutocompleteArrayInput, ReferenceArrayInput, TextField, useRecordContext } from "react-admin";
import { useWatch } from "react-hook-form";

export type UserInputProps = {

}

const UserInput = (props: UserInputProps) => {
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