import { Grid, makeStyles, Typography } from "@material-ui/core"
import IDField from "./IDField";
import WaiverInput from "./WaiverInput";
import classNames from "classnames";
import RichTextInput from "ra-input-rich-text";
import { FileField, FileInput, maxLength, minLength, NumberInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useEffect, useState } from "react";
import TaskManager from "./TaskManager";
import { useForm } from "react-final-form";
import get from "lodash.get";
import { ITaskTemplate } from "src/util/types";

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

export type ModuleFieldsProps = {
    getSource: Function,
    initialValues?: any,
    calculateTTC?: Function
}

const ModuleFields = (props: ModuleFieldsProps) => {
    const { getSource, initialValues } = props
    const classes = useStyles();
    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const [showFileUpload, setShowFileUpload] = useState(initialValues?.waive_module || false);

    const form = useForm();

    const recalculateTTC = (data: any) => {
        const formData = form.getState().values;
        if (!get(formData, getSource?.('tasks') || "")) return;

        let module_ttc = 0;
        for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(get(formData, getSource?.('tasks') || ""))) {
            let stepTTC: number = 0;
            for (let [taskKey, task] of Object.entries<ITaskTemplate>(step)) {
                if (task.ttc < stepTTC) continue;
                stepTTC = task.ttc;
            }
            module_ttc += stepTTC;
        }

        if (module_ttc == get(formData, getSource?.('ttc') || "")) return;

        form.change(getSource?.('ttc'), module_ttc);
    }

    useEffect(() => (props.calculateTTC) ? props.calculateTTC() : null, [get(form.getState().values, getSource?.('ttc'))])

    return (
        <>
            <Grid container spacing={2} style={{
                marginTop: '.1rem'
            }}>
                <IDField source={getSource('id') || ""} id={props.initialValues?.id} />
                <Grid item xs={4}>
                    <TextInput
                        source={getSource('title') || ""}
                        label="project.fields.module_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>

                <Grid item xs={3}>
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
                        disabled={false}
                        initialValue="AWAITING"
                        label="project.fields.module_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>

                <Grid item xs={3}>
                    <NumberInput
                        source={getSource?.('ttc') || ""}
                        label="template.module.fields.ttc"
                        fullWidth
                        helperText="template.module.fields.ttc_help"
                        disabled
                    />
                </Grid>

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
                    <RichTextInput source={getSource?.('waive.comment') || ""} toolbar={[['bold', 'italic', 'underline']]} label="" helperText=" " />
                </Grid>
                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <FileInput source={getSource?.('waive.file') || ""} accept="application/pdf" fullWidth label="" labelSingle="project.fields.waiver_file" helperText=" ">
                        <FileField source="src" title="title" download={true} />
                    </FileInput>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{
                marginTop: '.5rem'
            }}>
                <Grid item xs={12}>
                    <TaskManager source={getSource?.('tasks') || ""} calculateTTC={recalculateTTC} />
                </Grid>
            </Grid>
        </>
    )
}

export default ModuleFields;