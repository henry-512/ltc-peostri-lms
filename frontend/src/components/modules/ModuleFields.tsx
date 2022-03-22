import { Grid, makeStyles, Typography } from "@material-ui/core"
import IDField from "./IDField";
import WaiverInput from "./WaiverInput";
import classNames from "classnames";
import RichTextInput from "ra-input-rich-text";
import { FileField, FileInput, maxLength, minLength, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useState } from "react";
import TaskManager from "./TaskManager";

const useStyles = makeStyles(theme => ({
    modulesForm: {
        marginTop: '0px'
    },
    modulesArrayInput: {
        marginTop: '10px'
    },
    waiverWrapper: {
        position: 'relative',
        height: '0px',
        transition: 'height 0.3s ease',
        overflow: 'hidden',
    },
    waiverWrapperOpen: {
        transition: 'height 0.3s ease',
        height: '190px',
        marginBottom: '-30px',
        maxHeight: 'unset'
    }
}))

type ModuleFieldsProps = {
    getSource: Function,
    initialValues?: any
}

const ModuleFields = (props: ModuleFieldsProps) => {
    const { getSource, initialValues } = props
    const classes = useStyles();
    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const [showFileUpload, setShowFileUpload] = useState(initialValues?.waive_module || false);

    return (
        <>
            <Grid container spacing={2} style={{
                marginTop: '.1rem'
            }}>
                <IDField source={getSource('id') || ""} id={props.initialValues?.id} />
                <Grid item xs={5}>
                    <TextInput
                        source={getSource('title') || ""}
                        label="project.fields.module_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>

                <Grid item xs={4}>
                    <SelectInput
                        source={getSource('status') || ""}
                        choices={[
                            { id: 'AWAITING', name: 'AWAITING' },
                            { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                            { id: 'COMPLETED', name: 'COMPLETED' },
                            { id: 'WAIVED', name: 'WAIVED' },
                            { id: 'ARCHIVED', name: 'ARCHIVED' }
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        disabled
                        initialValue="AWAITING"
                        label="project.fields.module_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={1}></Grid>

                <Grid item xs={2} style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <WaiverInput source={getSource?.() || ""} setShowSteps={setShowFileUpload} />
                </Grid>
            </Grid>

            <Grid container spacing={4} className={classNames(classes.waiverWrapper, {
                [classes.waiverWrapperOpen]: showFileUpload
            })}>
                <Grid item xs={12}>
                    <Typography variant="h6">
                        {translate('project.layout.waive_help')}
                    </Typography>
                </Grid>
                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <RichTextInput source={getSource?.('waive_comment') || ""} toolbar={[['bold', 'italic', 'underline']]} label="" helperText=" " />
                </Grid>
                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <FileInput source={getSource?.('waive_module_file') || ""} accept="application/pdf" fullWidth label="" labelSingle="project.fields.waiver_file" helperText=" ">
                        <FileField source="src" title="title" download={true} />
                    </FileInput>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{
                marginTop: '.5rem'
            }}>
                <Grid item xs={12}>
                    <TaskManager source={getSource?.('tasks') || ""} />
                </Grid>
            </Grid>
        </>
    )
}

export default ModuleFields;