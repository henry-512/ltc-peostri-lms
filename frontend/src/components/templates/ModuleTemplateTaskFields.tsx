import { Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import get from "lodash.get";
import { useEffect } from "react";
import { maxLength, minLength, NumberInput, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { IDField } from "src/components/misc";

const PREFIX = 'ModuleTemplateTaskFields';

const classes = {
    taskForm: `${PREFIX}-taskForm`,
    taskTitle: `${PREFIX}-taskTitle`,
    taskFieldWrapper: `${PREFIX}-taskFieldWrapper`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.taskForm}`]: {
        marginTop: '1.75rem'
    },

    [`& .${classes.taskTitle}`]: {
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

    [`& .${classes.taskFieldWrapper}`]: {
        alignItems: 'flex-start',
        marginTop: '0'
    }
}));

export type ModuleTemplateTaskFieldsProps = {
    getSource?: Function,
    defaultValues?: any,
    calculateTTC: any
}

const ModuleTemplateTaskFields = (props: ModuleTemplateTaskFieldsProps) => {
    const { getSource } = props;

    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    //const form = useForm();
    // TODO
    //useEffect(() => props.calculateTTC(), [get(form.getState().values, getSource?.('ttc'))]);

    return (
        <Root>
            <Grid container spacing={4} className={classes.taskFieldWrapper}>
                <IDField source={getSource?.('id') || ""} id={props.defaultValues?.id} />
                <Grid item xs={5} style={{ marginTop: '-18px'}}>
                    <TextInput
                        source={getSource?.('title') || ""}
                        label="project.fields.task_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>
                <Grid item xs={4} style={{ marginTop: '-18px'}}>
                    <SelectInput
                        source={getSource?.('type') || ""}
                        choices={[
                            { id: 'DOCUMENT_UPLOAD', name: translate('tasks.types.document_upload') },
                            { id: 'DOCUMENT_REVIEW', name: translate('tasks.types.document_review') },
                            { id: 'DOCUMENT_APPROVE', name: translate('tasks.types.document_approve') },                                                                                  
                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval') },
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        label="project.fields.task_type"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                        emptyValue={null}
                        emptyText={<></>}
                        disableValue="not_available"
                    />
                </Grid>
                <Grid item xs={3} style={{ marginTop: '-18px'}}>
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
                        defaultValue="AWAITING"
                        label="project.fields.task_status"
                        validate={[required()]}
                        emptyValue={null}
                        emptyText={<></>}
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={3} style={{ marginTop: '-32px' }}>
                    <ReferenceInput
                        reference="admin/ranks"
                        source={getSource?.('rank') || ""}
                    >
                        <SelectInput
                            optionText={choice => `${choice.name}`}
                            optionValue="id"
                            helperText=" "
                            label="project.fields.rank"
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
        </Root>
    );
}

export default ModuleTemplateTaskFields;