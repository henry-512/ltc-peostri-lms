import { Box } from "@mui/material";
import { DeleteButton, SaveButton, Toolbar, ToolbarProps } from "react-admin";
import { useFormState } from "react-hook-form";

export interface TemplateToolbarProps extends ToolbarProps {
    create: boolean;
}

const TemplateToolbar = (props: TemplateToolbarProps) => {
    const { isValid, isDirty } = useFormState();

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
                disabled={(props.create) ? (!isValid || !isDirty) : (!isValid)}
            />
        </Toolbar>
    )
}

export default TemplateToolbar;