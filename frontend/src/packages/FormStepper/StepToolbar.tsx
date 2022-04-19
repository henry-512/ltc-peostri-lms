import { Box, Typography } from "@mui/material"
import { MouseEventHandler } from "react";
import { Button, DeleteWithConfirmButton, SaveButton, Toolbar, ToolbarProps, useFormGroup, useRecordContext, useTranslate } from "react-admin"
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
    const { isValid, isDirty, errors } = useFormGroup(props.validator);

    const record = useRecordContext();
    const translate = useTranslate();

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
                    confirmTitle={translate("layout.button.confirm_delete_title", { name: record.title })}
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
                    disabled={(props.create) ? (!isValid) : (!isValid)}
                    alwaysEnable={(props.defaultValue || !props.create) ? true : false}
                />
            )}
        </Toolbar>
    )
}