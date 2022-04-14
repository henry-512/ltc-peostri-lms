import { Grid, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { IDField } from "src/components/misc";
import WaiverInput from "./WaiverInput";
import classNames from "classnames";
import { RichTextInput } from "ra-input-rich-text";
import { FileField, FileInput, maxLength, minLength, NumberInput, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useState } from "react";
import TaskManager from "../TaskManager";

const PREFIX = 'ModuleFields';

const classes = {
    modulesForm: `${PREFIX}-modulesForm`,
    modulesArrayInput: `${PREFIX}-modulesArrayInput`,
    waiverWrapper: `${PREFIX}-waiverWrapper`,
    waiverWrapperOpen: `${PREFIX}-waiverWrapperOpen`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.modulesForm}`]: {
        marginTop: '0px'
    },

    [`& .${classes.modulesArrayInput}`]: {
        marginTop: '10px'
    },

    [`& .${classes.waiverWrapper}`]: {
        position: 'relative',
        height: '0px',
        transition: 'height 0.3s ease',
        overflow: 'hidden',
    },

    [`& .${classes.waiverWrapperOpen}`]: {
        transition: 'height 0.3s ease',
        height: '190px',
        marginBottom: '-30px',
        maxHeight: 'unset'
    },

    '& .MuiFilledInput-root': {
        height: '100%'
    }
}));

export type ModuleFieldsProps = {
    getSource: Function,
    defaultValues?: any,
    calculateTTC?: Function
}

const ModuleFields = (props: ModuleFieldsProps) => {
    const { getSource, defaultValues } = props

    const translate = useTranslate();
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const [showFileUpload, setShowFileUpload] = useState(defaultValues?.waive_module || false);

    /*const recalculateTTC = (data: any) => {
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

    useEffect(() => (props.calculateTTC) ? props.calculateTTC() : null, [get(form.getState().values, getSource?.('ttc'))])*/

    return (
        <Root>
            <Grid container spacing={2} style={{
                marginTop: '.1rem'
            }}>
                <IDField source={getSource('id') || ""} id={props.defaultValues?.id} />
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
                        defaultValue="AWAITING"
                        validate={[required()]}
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
                    <TextInput source={getSource?.('waive.comment') || ""} label="project.fields.waive_comment" multiline fullWidth helperText=" " sx={{
                        
                            height: 'calc(100% - 1rem)',
                    
                        '& .MuiFilledInput-root': {
                            height: '100%'
                        }
                    }} />
                </Grid>
                <Grid item xs={6} style={{ marginTop: '-32px' }}>
                    <FileInput source={getSource?.('waive.file') || ""} accept="application/pdf" fullWidth label="project.fields.waive_file_upload" labelSingle="project.fields.waiver_file" helperText=" ">
                        <FileField source="src" title="title" download={true} />
                    </FileInput>
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{
                marginTop: '.5rem'
            }}>
                <Grid item xs={12}>
                    <TaskManager source={getSource?.('tasks') || ""} calculateTTC={/*recalculateTTC TODO */ () => true} />
                </Grid>
            </Grid>
        </Root>
    );
}

export default ModuleFields;