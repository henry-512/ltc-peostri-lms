import { ReferenceInput, required, AutocompleteInput, useDataProvider, useTranslate, useRedirect } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { useFormContext, useFormState } from "react-hook-form";

const PREFIX = 'CreateProjectFromTemplateDialog';

const classes = {
    dialog: `${PREFIX}-dialog`,
    dialogContent: `${PREFIX}-content`,
    dialogActions: `${PREFIX}-actions`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.dialog}`]: {
        margin: 0,
        padding: theme.spacing(2),
        borderBottom: '1px solid ' + theme.palette.borderColor?.main
    },
    [`& .${classes.dialogContent}`]: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1)
    },
    [`& .${classes.dialogActions}`]: {
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

const omitID = (data: any) => {
    delete data.id;
    return data;
}

const CreateProjectFromTemplateDialog = (props: CreateProjectFromTemplateDialogProps) => {
    const translate = useTranslate();
    const dataProvider = useDataProvider();
    const redirect = useRedirect();
    const { isValid } = useFormState();
    const { getValues, setValue } = useFormContext();
    
    const handleSubmit = async () => {
        const template_id = getValues('project_template_id');
        
        dataProvider.getOne('admin/template/projects/instance', { id: template_id })
        .then(response => {
            redirect('create', 'admin/projects', undefined, {}, { record: {...omitID(response.data)}});
        })
        .catch(e => {
            redirect('list', 'admin/projects');
        });

        props.setOpen(false);
    }

    const handleClose = () => {        
        //Close window
        props.setOpen(false);

        //Reset the field to empty
        setValue('project_template_id', '');
    }

    return (
        <Root>
            <Dialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel} className={classes.dialog}>{props.label}</DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <ReferenceInput label="project.layout.select_template" source="project_template_id" reference="admin/template/projects">
                        <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                    </ReferenceInput>
                </DialogContent>
                <DialogActions className={classes.dialogActions}>
                    <Button onClick={handleClose} color="primary">
                        {translate('project.layout.cancel')}
                    </Button>
                    <Box sx={{ flex: '1 1 auto' }} />
                    <Button onClick={handleSubmit} color="primary" disabled={!isValid}>
                        {translate('project.layout.create')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Root>
    );
}

export default CreateProjectFromTemplateDialog;

