/**
* @file Auto assign array input used by the task fields for auto assigning users based on rank.
* @module AutoAssignArrayInput
* @category TaskManager
* @author Braden Cariaga
*/

import { AutocompleteArrayInput, useChoicesContext } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export interface AutoAssignArrayInputProps {
    getSource?: Function
    source?: string
    label: string
}

const AutoAssignArrayInput = (props: AutoAssignArrayInputProps) => {
    const {
        allChoices
    } = useChoicesContext(props);

    const { getValues, setValue } = useFormContext();
    
    const rank = useWatch({ name: props.getSource?.('rank'), exact: true });

    /**
     * If the user is in the list of users, and the user is not already in the list of users, then add
     * the user to the list of users.
     */
    const autoAssign = () => {
        const [users, autoAssign] = getValues(["users", "auto_assign"]);
        if (!autoAssign || !users) return;
        
        if (!rank) return;

        const currentUsers = getValues(props.getSource?.('users'));

        allChoices.forEach((user: any, i: number) => {
            if (user.rank.id !== rank) return;
            if (!users.includes(user.id)) return;
            if (currentUsers && currentUsers.includes(user.id)) return;

            setValue(`${props.getSource?.('users')}`, [...(currentUsers || []), user.id]);
        })
    }

    autoAssign();

    return (
        <>
            <AutocompleteArrayInput
                optionText={choice => `${choice.firstName} ${choice.lastName} (${choice.id.substring(0, 4)})`}
                optionValue="id"
                helperText=" "
                fullWidth
                source={props.source}
                label={props.label}
            />
        </>
    )
}

export default AutoAssignArrayInput;