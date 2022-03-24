import { FormGroupContextProvider, ReferenceInput, required, AutocompleteInput, useDataProvider, useFormGroup, useTranslate, SimpleForm, FormWithRedirect } from "react-admin";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles } from "@material-ui/core";
import { useForm } from "react-final-form";
import { useHistory } from "react-router";

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

type CreateProjectFromTemplateDialogProps = {
    ariaLabel: string;
    maxWidth?: "lg" | "xs" | "md" | "xl" | "sm";
    label: string;
    open: boolean;
    setOpen: Function;
}

const CreateProjectFromTemplateDialog = (props: CreateProjectFromTemplateDialogProps) => {
    const dialogStyles = useDialogStyles();
    const dialogActionStyles = useDialogActionsStyles();
    const dialogContentStyles = useDialogContentStyles();

    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const form = useForm();
    const history = useHistory();
    
    const handleSubmit = async () => {
        const template_id = form.getState().values.project_template_id;
        
        dataProvider.getOne('template/projects/instance', { id: template_id })
        .then(response => {
            history.push('/projects/create', {
                record: response
            })
        });

        props.setOpen(false);
    }

    const handleClose = () => {
        props.setOpen(false);
    }

    return (
        <>
            <Dialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel} classes={dialogStyles}>{props.label}</DialogTitle>
                <DialogContent classes={dialogContentStyles}>
                    <ReferenceInput label="project.layout.select_template" source="project_template_id" reference="template/projects">
                        <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                    </ReferenceInput>
                </DialogContent>
                <DialogActions classes={dialogActionStyles}>
                    <Button onClick={handleClose} color="primary">
                        {translate('project.layout.cancel')}
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleSubmit} color="primary" disabled={form.getState().invalid ? true : false}>
                        {translate('project.layout.create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}

export default CreateProjectFromTemplateDialog;

