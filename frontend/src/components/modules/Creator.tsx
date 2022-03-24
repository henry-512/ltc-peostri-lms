import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from '@material-ui/core';
import React from 'react';
import { FormGroupContextProvider, useFormGroup, useTranslate, Button as RAButton } from 'react-admin';
import { useForm } from 'react-final-form';
import DeleteIcon from '@material-ui/icons/Delete';

const useDialogStyles = makeStyles(theme => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        borderBottom: '1px solid ' + theme.palette.borderColor?.main
    }
}));

const useDialogContentStyles = makeStyles((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: 0
    }
}));

const useDialogActionsStyles = makeStyles((theme) => ({
    root: {
        margin: 0,
        padding: theme.spacing(2),
        borderTop: '1px solid ' + theme.palette.borderColor?.main,
        display: 'flex',
        justifyContent: 'space-between'
    }
}));

type CreatorProps = {
    open: boolean;
    setOpen: Function;
    ariaLabel: string;
    children: JSX.Element | JSX.Element[];
    create?: boolean;
    label: string;
    cancelAction: Function;
    submitAction: Function;
    deleteAction?: Function;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
}

const Creator = (props: CreatorProps) => {
    const translate = useTranslate();
    const form = useForm();
    const formData = form.getState().values;

    const dialogStyles = useDialogStyles();
    const dialogContentStyles = useDialogContentStyles();
    const dialogActionStyles = useDialogActionsStyles();

    const handleClose = () => {
        if (props.cancelAction) {
            props.cancelAction();
        }
        props.setOpen(false);
    }

    const handleSubmit = () => {
        if (props.submitAction) {
            props.submitAction();
        }
        props.setOpen(false);
    }

    const handleDelete = () => {
        if (props.deleteAction) {
            props.deleteAction();
        }
        props.setOpen(false);
    }

    const formGroupState = useFormGroup(props.ariaLabel);

    return (
        <>
            <Dialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'lg')}>
                <DialogTitle id={props.ariaLabel} classes={dialogStyles}>{props.label}</DialogTitle>
                <DialogContent classes={dialogContentStyles}>
                    <FormGroupContextProvider name={props.ariaLabel}>
                        {React.Children.map(props.children, (child, index) => {
                            return React.cloneElement(child, {
                                key: index,
                                ...props
                            })
                        })}
                    </FormGroupContextProvider>
                </DialogContent>
                <DialogActions classes={dialogActionStyles}>
                    {
                        (!props.create) ? (
                            <RAButton onClick={handleDelete} variant="outlined" label="layout.button.delete"
                                style={{
                                    borderColor: '#f44336',
                                    padding: '6px 16px',
                                    marginRight: '8px',
                                    color: '#f44336',
                                    fontSize: '0.8125rem',
                                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                                    fontWeight: '500',
                                    lineHeight: '1.75',
                                    letterSpacing: '0.02857em',
                                    textTransform: 'uppercase'
                                }}>
                                <DeleteIcon />
                            </RAButton>
                        ) : (
                            <></>
                        )
                    }
                    <Button onClick={handleClose} color="primary">
                        {translate('project.layout.cancel')}
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleSubmit} color="primary" disabled={formGroupState.invalid ? true : false}>
                        {props.create ? translate('project.layout.create') : translate('project.layout.save')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default Creator;