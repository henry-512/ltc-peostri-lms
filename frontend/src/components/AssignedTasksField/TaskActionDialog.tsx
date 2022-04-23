import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useRedirect, Form, SimpleForm, SaveButton } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";
import { cloneElement, ReactNode } from "react";
import React from "react";

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
        margin: 0,
        padding: theme.spacing(2),
        borderBottom: '1px solid ' + theme.palette.borderColor?.main
    },
    '& .MuiDialogContent-root': {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(1) + " !important",
        paddingBottom: theme.spacing(1)
    },
    '& .MuiDialogActions-root': {
        margin: 0,
        padding: theme.spacing(2),
        borderTop: '1px solid ' + theme.palette.borderColor?.main,
        display: 'flex',
        justifyContent: 'space-between'
    }
}));

export type TaskActionDialogProps = {
    ariaLabel: string;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
    label: string;
    open: boolean;
    children: JSX.Element[] | JSX.Element
    handleSubmit: any
    handleClose: any
    submitText: string
    submitIcon: JSX.Element
    allowEmptySubmit?: boolean
}

const TaskActionDialog = (props: TaskActionDialogProps) => {
    const translate = useTranslate();

    return (
        <>
            <StyledDialog open={props.open} onClose={props.handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <Form
                    mode="onBlur"
                    onSubmit={props.handleSubmit}
                    defaultValues={{}}
                    record={{}}
                >
                    <DialogTitle id={props.ariaLabel}>{props.label}</DialogTitle>
                    <DialogContent>
                        {React.Children.map(props.children, (child, index) => {
                            return cloneElement(child, {
                                key: `${props.ariaLabel}-${index}`
                            })
                        })}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={props.handleClose} color="primary">
                            {translate('project.layout.cancel')}
                        </Button>
                        <Box sx={{ flex: '1 1 auto' }} />
                        <SaveButton alwaysEnable={props.allowEmptySubmit} label={props.submitText} icon={props.submitIcon} />
                    </DialogActions>
                </Form>
            </StyledDialog>
        </>
    );
}

export default TaskActionDialog;

