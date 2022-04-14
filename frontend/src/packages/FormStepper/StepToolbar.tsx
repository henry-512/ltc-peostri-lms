import { Box, Typography } from "@mui/material"
import { MouseEventHandler } from "react";
import { Button, DeleteButton, SaveButton, Toolbar, ToolbarProps, useFormGroup, useTranslate } from "react-admin"
import { useFormState } from "react-hook-form";

export interface StepToolbarProps extends ToolbarProps {
    active: number;
    stepCount: number;
    optional: boolean;
    handleNext: MouseEventHandler;
    handleBack: MouseEventHandler;
    handleSkip: MouseEventHandler;
    backText: string;
    validator: string;
    create: boolean;
}

export default function StepToolbar(props: StepToolbarProps) {
    const translate = useTranslate();
    const { isValid, isDirty, errors } = useFormGroup(props.validator);

    console.log(isValid, isDirty, errors)

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
            <Button
                color="inherit"
                disabled={props.active === 0}
                onClick={props.handleBack}
                label={translate('layout.button.back')}
            />
            {
                (props?.backText != "") ? (
                    <Typography variant="caption">
                        {props.backText}
                    </Typography>
                ) : (
                    <></>
                )
            }
            <Box sx={{ flex: '1 1 auto' }} />
            {props.optional && (
                <Button color="inherit" onClick={props.handleSkip}
                    label={translate('layout.button.skip')} />
            )}
            {(props.active !== props.stepCount - 1) ? (
                <Button onClick={props.handleNext} label={translate('layout.button.next')} disabled={(props.create) ? (!isValid || !isDirty) : (!isValid)} />
            ) : (
                <SaveButton
                    label={(props.create) ? "layout.button.create" : "layout.button.save"}
                    disabled={!isValid ? true : false}
                />
            )}
        </Toolbar>
    )
}