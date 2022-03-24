import { useState } from "react";
import { FormGroupContext, FormGroupContextProvider, ReferenceInput, required, SelectInput, useDataProvider, useFormGroup, useTranslate } from "react-admin";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import dataProvider from "src/util/dataProvider";
import { useForm } from "react-final-form";

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
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
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

type AddTemplateModuleDialogProps = {
    ariaLabel: string;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
    label: string;
    open: boolean;
    setOpen: Function;
    isTemplate?: boolean;
}

const AddTemplateModuleDialog = (props: AddTemplateModuleDialogProps) => {
    const dialogStyles = useDialogStyles();
    const dialogActionStyles = useDialogActionsStyles();
    const dialogContentStyles = useDialogContentStyles();

    const translate = useTranslate();
    const formGroupState = useFormGroup(props.ariaLabel);
    const dataProvider = useDataProvider();
    const form = useForm();
    
    const handleSubmit = async () => {
        const template_id = form.getState().values.module_template_id

        if (props.isTemplate) {
            dataProvider.getOne('template/modules', { id: template_id })
            .then(response => console.log(response));
            return;
        }

        dataProvider.getOne('template/modules/instance', { id: template_id })
        .then(response => console.log(response));
    }

    const handleClose = () => props.setOpen(false);

    return (
        <>
            <Dialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel} classes={dialogStyles}>{props.label}</DialogTitle>
                <DialogContent classes={dialogContentStyles}>
                    <FormGroupContextProvider name={props.ariaLabel} >
                        <ReferenceInput label="project.layout.select_module_template" source="module_template_id" reference="template/modules">
                            <SelectInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                        </ReferenceInput>
                    </FormGroupContextProvider>
                </DialogContent>
                <DialogActions classes={dialogActionStyles}>
                    <Button onClick={handleClose} color="primary">
                        {translate('project.layout.cancel')}
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleSubmit} color="primary" disabled={formGroupState.invalid ? true : false}>
                        {translate('project.layout.create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default AddTemplateModuleDialog;

