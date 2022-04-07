import { Box } from "@material-ui/core"
import { DeleteButton, SaveButton, Toolbar, ToolbarProps } from "react-admin"
import { useFormState } from "react-final-form";

export interface TeamToolbarProps extends ToolbarProps {
    create: boolean;
}

export default function TeamToolbar(props: TeamToolbarProps) {
    const formState = useFormState();

    return (
        <Toolbar {...props}>
            {(!props.create) ? (
                <DeleteButton
                    label={"layout.button.delete"}
                    redirect="list"
                    variant="outlined"
                    style={{
                        borderColor: '#f44336',
                        padding: '6px 16px',
                        marginRight: '8px'
                    }}
                />
            ) : (
                <></>
            )}
            <Box sx={{ flex: '1 1 auto' }} />
            <SaveButton
                label={(props.create) ? "layout.button.create" : "layout.button.save"}
                redirect="edit"
                disabled={(formState.invalid || !formState.dirty) ? true : false}
            />
        </Toolbar>
    )
}