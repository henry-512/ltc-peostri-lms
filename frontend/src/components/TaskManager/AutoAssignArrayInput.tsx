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

    // TODO FIX RE-RENDERS

    //useCallback(() => autoAssign(), [rank])

    //useEffect(() => autoAssign(), [])

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