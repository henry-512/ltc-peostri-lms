import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
import IDField from "../modules/IDField";
import { maxLength, minLength, NumberInput, required, SelectInput, TextInput } from "react-admin";
import TaskManager from "../modules/TaskManager";
import { SectionTitle } from "../misc";
import { ModuleTemplateTaskFields } from ".";
import { useEffect } from "react";
import { useForm, useFormState } from "react-final-form";
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

type ModuleTemplateFieldsProps = {
    getSource: Function,
    initialValues?: any
}

const ModuleTemplateFields = (props: ModuleTemplateFieldsProps) => {
    const { getSource } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const formData = useFormState().values;
    const form = useForm();

    useEffect(() => {
        if (!formData.tasks) return;

        let module_ttc = 0;
        for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(formData.tasks)) {
            let stepTTC: number = 0;
            for (let [taskKey, task] of Object.entries<ITaskTemplate>(step)) {
                if (task.ttc < stepTTC) continue;
                stepTTC = task.ttc;
            }
            module_ttc += stepTTC;
        }

        if (module_ttc == formData.ttc) return;

        form.change('ttc', module_ttc);
    }, [formData.tasks])

    return (
        <>
            <Box display="flex" width="100%" flexDirection="column">
                <SectionTitle label="template.module.layout.general" />
                <Grid container spacing={4}>
                    <Grid item xs={5}>
                        <IDField source={getSource('id') || ""} id={props.initialValues?.id} />
                        <TextInput
                            source={getSource('title') || ""}
                            label="template.module.fields.title"
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
                            initialValue="AWAITING"
                            label="template.module.fields.status"
                            fullWidth
                            helperText=" "
                        />
                    </Grid>
                    
                    <Grid item xs={3}>
                        <NumberInput
                            source="ttc"
                            label="template.module.fields.ttc"
                            fullWidth
                            helperText="Calculated Based on Tasks"
                            validate={[required()]}
                            disabled
                        />
                    </Grid>
                </Grid>
                <TaskManager source="tasks" fields={<ModuleTemplateTaskFields />}/>
            </Box>
        </>
    )
}

export default ModuleTemplateFields;