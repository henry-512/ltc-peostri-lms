import get from "lodash.get";
import { useEffect } from "react";
import { AutocompleteArrayInput, useChoicesContext } from "react-admin";
import { useFormContext } from "react-hook-form";

export interface AutoAssignArrayInputProps {
    source?: string
    label: string
}

const AutoAssignArrayInput = (props: AutoAssignArrayInputProps) => {
    const {
        allChoices
    } = useChoicesContext(props);

    const { getValues, setValue } = useFormContext();

    const autoAssign = () => {
        const [users, autoAssign] = getValues(["users", "auto_assign"])
        if (!users) return;
        if (!autoAssign) return;
        if (!props.source) return;
        const data = getValues(props.source)
        if (!data) return;

        allChoices.forEach((user: any, i: number) => {
            if (user.rank.id != data.rank) return;
            if (!users.includes(user.id)) return;
            if (typeof data.users != 'undefined' && data.users.includes(user.id)) return;

            setValue(`${props.source}.users`, [...(data.users || []), user.id]);
        })
    }

    useEffect(() => {
        autoAssign();
    });

    return (
        <>
            <AutocompleteArrayInput
                optionText={choice => `${choice.firstName} ${choice.lastName} (${choice.id.substring(0, 4)})`}
                optionValue="id"
                helperText=" "
                fullWidth
                {...props}
            />
        </>
    )
}

export default AutoAssignArrayInput;