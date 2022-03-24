import { Grid, makeStyles } from "@material-ui/core"
import get from "lodash.get";
import { useEffect } from "react";
import { maxLength, minLength, NumberInput, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useForm, useFormState } from "react-final-form";
import AutoAssignArrayInput from "../modules/AutoAssignArrayInput";
import IDField from "../modules/IDField";

const useStyles = makeStyles(theme => ({
    taskForm: {
        marginTop: '1.75rem'
    },
    taskTitle: {
        position: 'absolute',
        width: 'auto',
        display: 'inline-block',
        top: '1rem',
        left: '1.5rem',
        fontSize: '1.4rem',
        borderBottom: '2px solid ' + theme.palette.primary.main,
        paddingBottom: '.25rem',
        lineHeight: '1',
        color: theme.palette.text.primary,
        whiteSpace: 'nowrap'
    },
    taskFieldWrapper: {
        alignItems: 'flex-start',
        marginTop: '0'
    }
}))

type ModuleTemplateTaskFieldsProps = {
    getSource?: Function,
    initialValues?: any,
    calculateTTC: any
}

const ModuleTemplateTaskFields = (props: ModuleTemplateTaskFieldsProps) => {
    const { getSource } = props;
    const classes = useStyles();
    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const formData = useFormState().values
    const form = useForm();

    useEffect(() => props.calculateTTC(), [get(form.getState().values, getSource?.('ttc'))]);

    return (
        <>
            <Grid container spacing={4} className={classes.taskFieldWrapper}>
                <IDField source={getSource?.('id') || ""} id={props.initialValues?.id} />
                <Grid item xs={5}>
                    <TextInput
                        source={getSource?.('title') || ""}
                        label="project.fields.task_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>
                <Grid item xs={4}>
                    <SelectInput
                        source={getSource?.('type') || ""}
                        choices={[
                            { id: 'DOCUMENT_UPLOAD', name: translate('tasks.types.document_upload') },
                            { id: 'DOCUMENT_REVIEW', name: translate('tasks.types.document_review') },
                            { id: 'DOCUMENT_APPROVE', name: translate('tasks.types.document_approve') },
                            { id: 'MODULE_WAIVER', name: translate('tasks.types.module_waiver') },                                                                                               
                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval') },
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        label="project.fields.task_type"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                        disableValue="not_available"
                    />
                </Grid>
                <Grid item xs={3}>
                    <SelectInput
                        source={getSource?.('status') || ""}
                        choices={[
                            { id: 'AWAITING', name: 'AWAITING' },
                            { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                            { id: 'COMPLETED', name: 'COMPLETED' },
                            { id: 'ARCHIVED', name: 'ARCHIVED' }
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        initialValue="AWAITING"
                        label="project.fields.task_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={3} style={{ marginTop: '-32px' }}>
                    <ReferenceInput
                        label="project.fields.rank"
                        reference="ranks"
                        source={getSource?.('rank') || ""}
                    >
                        <SelectInput
                            optionText={choice => `${choice.name}`}
                            optionValue="id"
                            helperText=" "
                            fullWidth
                        />
                    </ReferenceInput>
                </Grid>

                <Grid item xs={9} style={{ marginTop: '-32px' }}>
                    <NumberInput
                        source={getSource?.('ttc') || ""}
                        label="template.module.fields.ttc"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                    />
                </Grid>
            </Grid>
        </>
    )
}

export default ModuleTemplateTaskFields;