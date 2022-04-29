import { Box, Grid } from "@mui/material"
import { maxLength, minLength, required, SelectInput, TextInput } from "react-admin";
import TaskManager from "src/components/TaskManager";
import SectionTitle from "src/components/SectionTitle";
import IDField from "src/components/IDField";
import ModuleTemplateTaskFields from "src/components/ModuleTemplateTaskFields";
import { useFormContext } from "react-hook-form";
import { ITaskTemplate } from "src/util/types";

export type ModuleTemplateFieldsProps = {
    getSource?: Function,
    defaultValues?: any,
    calculateTTC?: Function
}

const ModuleTemplateFields = (props: ModuleTemplateFieldsProps) => {
    const { getSource } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];

    const { setValue, getValues } = useFormContext();

    const recalculateTTC = () => {
        const tasks = getValues(getSource?.('tasks'));
        if (!tasks) return;

        let module_ttc = 0;
        for (let [, step] of Object.entries<ITaskTemplate[]>(tasks)) {
            let stepTTC: number = 0;
            for (let [, task] of Object.entries<ITaskTemplate>(step)) {
                if (parseInt(`${task.ttc}`) < stepTTC) continue;
                stepTTC = parseInt(`${task.ttc}`);
            }
            module_ttc += stepTTC;
        }

        if (module_ttc === getValues(getSource?.('ttc'))) return;

        setValue(getSource?.('ttc'), module_ttc);

        if (props.calculateTTC) props.calculateTTC()
    }

    return (
        <>
            <Box display="flex" width="100%" flexDirection="column" style={{ marginTop: '1rem' }}>
                <SectionTitle label="template.module.layout.general" />
                <Grid container spacing={4}>
                    <Grid item xs={5}>
                        <IDField source={getSource?.('id') || ""} id={props.defaultValues?.id} />
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
                            defaultValue="AWAITING"
                            label="template.module.fields.status"
                            validate={[required()]}
                            emptyValue={null}
                            emptyText={<></>}
                            fullWidth
                            helperText=" "
                        />
                    </Grid>
                    
                    <Grid item xs={3}>
                        <TextInput
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