/**
* @file Dialog component for adding a module to the module manager from a template.
* @module AddTemplateModuleDialog
* @category AddTemplateModule
* @author Braden Cariaga
*/

import { FormGroupContextProvider, ReferenceInput, required, AutocompleteInput, useDataProvider, useFormGroup, useTranslate } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext } from "react-hook-form";

/* A styled component. */
const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogTitle-root': {
        margin: 0,
        padding: theme.spacing(2),
        borderBottom: '1px solid ' + theme.palette.borderColor?.main
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
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

export type AddTemplateModuleDialogProps = {
    ariaLabel: string;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
    label: string;
    open: boolean;
    setOpen: Function;
    cancelAction?: Function;
    submitAction?: Function;
    getSource: Function;
    isTemplate?: boolean;
    calculateTTC?: Function;
    updateComponent: Function;
}

/* 
 * A function that takes in a parameter called props.
 * @param {AddTemplateModuleProps} props - AddTemplateModuleProps
 */
const AddTemplateModuleDialog = (props: AddTemplateModuleDialogProps) => {
    const translate = useTranslate();
    const { isValid } = useFormGroup(props.ariaLabel);
    const dataProvider = useDataProvider();

    const { setValue, getValues } = useFormContext();

    /**
     * "If the form is not a template, delete the id, otherwise delete the createdAt and updatedAt,
     * then set the value of the form to the data, calculate the TTC, submit the form, close the form,
     * and set the value of the module_template_id to an empty string."
     * </code>
     * @param {any}  - props.getSource() =&gt; this is a function that returns the source of the form
     */
    const updateForm = ({ data }: any) => {
        if (!props.isTemplate) {
            delete data.id;
        } else {
            delete data.createdAt;
            delete data.updatedAt;
        }
        setValue(props.getSource(), data);
        props.calculateTTC?.();

        if (props.submitAction) {
            props.submitAction();
        }
        props.setOpen(false);
        setValue('module_template_id', '');
    }
    
    /**
     * If the user is on the template page, get the template data, otherwise get the instance data.
     */
    const handleSubmit = async () => {
        const template_id = getValues('module_template_id');

        if (props.isTemplate) {
            dataProvider.getOne('admin/template/modules', { id: template_id })
            .then(response => updateForm(response))
            .catch((e) => handleClose());
        } else {
            dataProvider.getOne('admin/template/modules/instance', { id: template_id })
            .then(response  => updateForm(response))
            .catch((e) => handleClose());
        }
    }

    /**
     * If the cancelAction prop is defined, call it, then set the open prop to false and set the value
     * of the module_template_id state to an empty string.
     */
    const handleClose = () => {
        if (props.cancelAction) {
            props.cancelAction();
        }
        props.setOpen(false);
        setValue('module_template_id', '');
    }

    return (
        <>
            <StyledDialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel}>{props.label}</DialogTitle>
                <DialogContent>
                    <FormGroupContextProvider name={props.ariaLabel} >
                        <ReferenceInput label="project.layout.select_module_template" source="module_template_id" reference="admin/template/modules">
                            <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                        </ReferenceInput>
                    </FormGroupContextProvider>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        {translate('project.layout.cancel')}
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleSubmit} color="primary" disabled={!isValid}>
                        {translate('project.layout.create')}
                    </Button>
                </DialogActions>
            </StyledDialog>
        </>
    );
}

export default AddTemplateModuleDialog;

