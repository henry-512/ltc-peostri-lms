import { AutocompleteArrayInput, ReferenceArrayInput } from "react-admin";
import { useWatch } from "react-hook-form";

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