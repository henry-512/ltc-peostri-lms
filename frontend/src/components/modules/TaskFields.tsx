import { Grid, makeStyles } from "@material-ui/core"
import { maxLength, minLength, ReferenceArrayInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import AutoAssignArrayInput from "./AutoAssignArrayInput";
import IDField from "./IDField";

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

type TaskFieldsProps = {
    getSource: Function,
    initialValues?: any
}

const TaskFields = (props: TaskFieldsProps) => {
    const { getSource } = props;
    const classes = useStyles();
    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];

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
                            //{ id: 'MODULE_WAIVER', name: translate('tasks.types.module_waiver'), not_available: true },                                                                                               
                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval'), not_available: true },
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
                        disabled
                        initialValue="AWAITING"
                        label="project.fields.task_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={3} style={{ marginTop: '-32px' }}>
                    <ReferenceInput
                        label="project.fields.usergroup"
                        reference="userGroups"
                        source={getSource?.('userGroup') || ""}
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
                    <ReferenceArrayInput
                        label="project.fields.member"
                        reference="users"
                        source={getSource?.('users') || ""}
                    >
                        <AutoAssignArrayInput source={getSource?.()} />
                    </ReferenceArrayInput>
                </Grid>
            </Grid>
        </>
    )
}

export default TaskFields;