import { Box } from "@mui/material"
import { DeleteWithConfirmButton, SaveButton, Toolbar, ToolbarProps } from "react-admin"
import { useFormState } from "react-hook-form";

export interface TeamToolbarProps extends ToolbarProps {
    create: boolean;
}

export default function TeamToolbar(props: TeamToolbarProps) {
    const { isValid, isDirty } = useFormState();

    return (
        <Toolbar {...props}>
            {(!props.create) ? (
                <DeleteWithConfirmButton
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
                disabled={(!isValid || !isDirty) ? true : false}
            />
        </Toolbar>
    )
}