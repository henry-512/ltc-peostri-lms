/**
* @file Generic task action dialog box
* @module TaskActionDialog
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useTranslate, Form, SaveButton } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { cloneElement } from "react";
import React from "react";

/* A styled component. */
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

/**
 * Generic task action dialog box
 * @param {TaskActionDialogProps} props - TaskActionDialogProps
 */
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

