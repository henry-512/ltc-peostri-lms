import { Box, Grid } from "@material-ui/core"
import { maxLength, minLength, NumberInput, required, SelectInput, TextInput } from "react-admin";
import TaskManager from "../TaskManager";
import { SectionTitle, IDField } from "../index";
import { ModuleTemplateTaskFields } from ".";
import { useEffect } from "react";
import { useForm } from "react-final-form";
import { ITaskTemplate } from "src/util/types";
import get from "lodash.get";

export type ModuleTemplateFieldsProps = {
    getSource?: Function,
    initialValues?: any,
    calculateTTC?: Function
}

const ModuleTemplateFields = (props: ModuleTemplateFieldsProps) => {
    const { getSource } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];
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
            <Box display="flex" width="100%" flexDirection="column" style={{ marginTop: '1rem' }}>
                <SectionTitle label="template.module.layout.general" />
                <Grid container spacing={4}>
                    <Grid item xs={5}>
                        <IDField source={getSource?.('id') || ""} id={props.initialValues?.id} />
                        <TextInput
                            source={getSource?.('title') || ""}
                            label="template.module.fields.title"
                            fullWidth
                            helperText=" "
                            validate={validateTitle}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SelectInput
                            source={getSource?.('status') || ""}
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
                            source={getSource?.('ttc') || ""}
                            label="template.module.fields.ttc"
                            fullWidth
                            helperText="template.module.fields.ttc_help"
                            disabled
                        />
                    </Grid>
                </Grid>
                <TaskManager source={getSource?.('tasks') || ""} fields={<ModuleTemplateTaskFields calculateTTC={recalculateTTC} />}/>
            </Box>
        </>
    )
}

export default ModuleTemplateFields;