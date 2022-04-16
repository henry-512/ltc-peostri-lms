import { Grid } from "@mui/material";
import { styled } from '@mui/material/styles';
import get from "lodash.get";
import { useEffect } from "react";
import { maxLength, minLength, NumberInput, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import AutoAssignArrayInput from "./AutoAssignArrayInput";
import { IDField } from "src/components/misc";
import { useFormContext } from "react-hook-form";

const PREFIX = 'TaskFields';

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

export type TaskFieldsProps = {
    getSource: Function,
    defaultValues?: any,
    calculateTTC?: Function
}

const TaskFields = (props: TaskFieldsProps) => {
    const { getSource } = props;

    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];

    const { getValues } = useFormContext();

    useEffect(() => {
        props.calculateTTC?.();
    }, [getValues(getSource?.('ttc'))])

    return (
        <Root>
            <Grid container spacing={4} className={classes.taskFieldWrapper}>
                <IDField source={getSource?.('id') || ""} id={props.defaultValues?.id} />
                <Grid item xs={5} style={{ marginTop: '-18px' }}>
                    <TextInput
                        source={getSource?.('title') || ""}
                        label="project.fields.task_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>
                <Grid item xs={4} style={{ marginTop: '-18px' }}>
                    <SelectInput
                        source={getSource?.('type') || ""}
                        choices={[
                            { id: 'DOCUMENT_UPLOAD', name: translate('tasks.types.document_upload') },
                            { id: 'DOCUMENT_REVIEW', name: translate('tasks.types.document_review') },
                            { id: 'DOCUMENT_APPROVE', name: translate('tasks.types.document_approve') },                                                                                              
                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval'), not_available: false },
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
                        disabled={false}
                        defaultValue="AWAITING"
                        validate={[required()]}
                        emptyValue={null}
                        emptyText={<></>}
                        label="project.fields.task_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <ReferenceInput
                        reference="admin/ranks"
                        source={getSource?.('rank') || ""}
                    >
                        <SelectInput
                            label="project.fields.rank"
                            optionText={choice => `${choice.name}`}
                            optionValue="id"
                            helperText=" "
                            fullWidth
                        />
                    </ReferenceInput>
                </Grid>

                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <TextInput
                        source={getSource?.('ttc') || ""}
                        label="template.module.fields.ttc"
                        fullWidth
                        helperText=" "
                        validate={[required()]}
                    />
                </Grid>

                <Grid item xs={12} style={{ marginTop: '-32px' }}>
                    <ReferenceArrayInput
                        reference="admin/users"
                        source={getSource?.('users') || ""}
                    >
                        <AutoAssignArrayInput label="project.fields.member" getSource={getSource} source={getSource?.('users') || ""} />
                    </ReferenceArrayInput>
                </Grid>
            </Grid>
        </Root>
    );
}

export default TaskFields;