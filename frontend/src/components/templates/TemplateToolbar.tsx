import { Box } from "@mui/material";
import { DeleteButton, EditActionsProps, SaveButton, Toolbar, ToolbarProps } from "react-admin";
import { useForm, useFormState } from "react-final-form";

export interface TemplateToolbarProps extends ToolbarProps {
    create: boolean;
}

const TemplateToolbar = (props: TemplateToolbarProps) => {
    const form = useForm();
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
                redirect="show"
                disabled={(formState.invalid || !formState.dirty) ? true : false}
            />
        </Toolbar>
    )
}

export default TemplateToolbar;