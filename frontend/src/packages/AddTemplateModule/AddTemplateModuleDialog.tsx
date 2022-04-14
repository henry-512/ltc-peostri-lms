import { FormGroupContextProvider, ReferenceInput, required, AutocompleteInput, useDataProvider, useFormGroup, useTranslate } from "react-admin";
import { styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";

const PREFIX = 'AddTemplateModuleDialog';

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

const AddTemplateModuleDialog = (props: AddTemplateModuleDialogProps) => {
    const translate = useTranslate();
    const { isValid } = useFormGroup(props.ariaLabel);
    const dataProvider = useDataProvider();

    // TODO
    /*const updateForm = ({ data }: any) => {
        if (!props.isTemplate) {
            delete data.id;
        } else {
            delete data.createdAt;
            delete data.updatedAt;
        }
        form.change(props.getSource(), data);
        props.updateComponent();
        props.calculateTTC?.();
    }
    
    const handleSubmit = async () => {
        const template_id = form.getState().values.module_template_id

        if (props.isTemplate) {
            dataProvider.getOne('admin/template/modules', { id: template_id })
            .then(response => updateForm(response))
            .catch((e) => handleClose());
        } else {
            dataProvider.getOne('admin/template/modules/instance', { id: template_id })
            .then(response  => updateForm(response))
            .catch((e) => handleClose());
        }

        if (props.submitAction) {
            props.submitAction();
        }
        props.setOpen(false);
        form.change('module_template_id', '');
    }

    const handleClose = () => {
        if (props.cancelAction) {
            props.cancelAction();
        }
        props.setOpen(false);
        form.change('module_template_id', '');
    }*/

    const handleClose = () => true
    const handleSubmit = () => true

    return (
        <Root>
            <Dialog open={props.open} onClose={handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel} className={classes.dialog}>{props.label}</DialogTitle>
                <DialogContent className={classes.dialogContent}>
                    <FormGroupContextProvider name={props.ariaLabel} >
                        <ReferenceInput label="project.layout.select_module_template" source="module_template_id" reference="admin/template/modules">
                            <AutocompleteInput optionText="title" optionValue="id" fullWidth validate={[required()]} helperText=" " />
                        </ReferenceInput>
                    </FormGroupContextProvider>
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

export default AddTemplateModuleDialog;

