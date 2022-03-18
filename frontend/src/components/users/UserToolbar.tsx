import { Box, Typography } from "@material-ui/core"
import { MouseEventHandler } from "react";
import { Button, DeleteButton, SaveButton, Toolbar, ToolbarProps, useFormGroup, useTranslate } from "react-admin"
import { useForm, useFormState } from "react-final-form";

export interface StepToolbarProps extends ToolbarProps {
    create: boolean;
}

export default function UserToolbar(props: StepToolbarProps) {
    const form = useForm();
    const formState = useFormState();

    console.log(formState)

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