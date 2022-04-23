/**
* @file Dialog component for creating a project from a template. ("select a template")
* @module CreateProjectFromTemplateDialog
* @category CreateProjectFromTemplate
* @author Braden Cariaga
*/

import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useRedirect, useNotify } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";

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

export type CreateProjectFromTemplateDialogProps = {
    ariaLabel: string;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
    label: string;
    open: boolean;
    setOpen: Function;
}

/**
 * It takes an object, deletes the id property, and returns the object
 * @param {any} data The data to omit the ID from.
 * @returns The data object with the id property deleted.
 */
const omitID = (data: any) => {
    delete data.id;
    return data;
}

/**
 * Creates a modal window that allows the user to select a template. When the user clicks the create button, the code is getting the value of the field, then using that value to make a request to an API, then redirecting to a new page with the response data.
 * @param {CreateProjectFromTemplateDialogProps} props - CreateProjectFromTemplateDialogProps
 */
const CreateProjectFromTemplateDialog = (props: CreateProjectFromTemplateDialogProps) => {
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const redirect = useRedirect();
    const { isValid } = useFormState();
    const { getValues, setValue } = useFormContext();
    const notify = useNotify();
    
    
    /**
     * I'm trying to get the value of a field in a form, then use that value to make a request to an
     * API, then redirect to a new page with the response data.
     * 
     * I'm using the react-admin framework, and I'm trying to use the dataProvider to make the request.
     * 
     * I'm using the getValues function to get the value of the field, and I'm using the redirect
     * function to redirect to the new page.
     * 
     * I'm using the setOpen function to close the modal.
     * 
     * I'm using the notify function to display an error message if the request fails.
     * 
     * I'm using the omitID function to remove the id from the response data.
     * 
     * I'm using the then function to handle the response data.
     * 
     * I'm using the catch function to handle the error.
     * 
     * I'm using the props object
     */
    const handleSubmit = () => {
        const template_id = getValues('project_template_id');
        
        dataProvider.getOne('admin/template/projects/instance', { id: template_id })
        .then(response => {
            redirect('create', 'admin/projects', undefined, {}, { record: {...omitID(response.data)}});
        })
        .catch(e => {
            notify(e);
        });

        props.setOpen(false);
    }

    /**
     * When the user clicks the close button, close the window and reset the field to empty.
     */
    const handleClose = () => {        
        //Close window
        props.setOpen(false);

        //Reset the field to empty
        setValue('project_template_id', '');
    }

    return (
        <>
            <StyledDialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel}>{props.label}</DialogTitle>
                <DialogContent>
                    <ReferenceInput label="project.layout.select_template" source="project_template_id" reference="admin/template/projects">
                        <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                    </ReferenceInput>
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

export default CreateProjectFromTemplateDialog;

