import { Box, Grid } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import { maxLength, minLength, NumberInput, required, SelectInput, TextInput } from "react-admin";
import { useForm, useFormState } from "react-final-form";
import { IModuleTemplate } from "src/util/types";
import { SectionTitle } from "src/components/misc";
import ModuleManager from "src/packages/ModuleManager";
import ModuleTemplateFields from "./ModuleTemplateFields";

export type ProjectTemplateFieldsProps = {

}

const ProjectTemplateFields = (props: ProjectTemplateFieldsProps) => {
    const validateTitle = [required(), minLength(2), maxLength(150)];
    const formData = useFormState().values;
    const form = useForm();

    const recalculateTTC = () => {
        const formData = form.getState().values;
        if (!formData.modules) return;

        let project_ttc = 0;
        for (let [stepKey, step] of Object.entries<IModuleTemplate[]>(formData.modules)) {
            let stepTTC: number = 0;
            for (let [moduleKey, module] of Object.entries<IModuleTemplate>(step)) {
                if (module.ttc < stepTTC) continue;
                stepTTC = module.ttc;
            }
            project_ttc += stepTTC;
        }

        if (project_ttc == formData.ttc) return;

        form.change('ttc', project_ttc);
    }

    return (
        <>
            <Box display="flex" width="100%" flexDirection="column">
                <SectionTitle label="template.project.layout.general" />
                <Grid container spacing={4}>
                    <Grid item xs={5}>
                        <TextInput
                            source="title"
                            label="template.project.fields.title"
                            fullWidth
                            helperText=" "
                            validate={validateTitle}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <SelectInput
                            source="status"
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
                            label="template.project.fields.status"
                            fullWidth
                            helperText=" "
                        />
                    </Grid>
                    
                    <Grid item xs={3}>
                        <NumberInput
                            source="ttc"
                            label="template.project.fields.ttc"
                            fullWidth
                            helperText="template.project.fields.ttc_help"
                            disabled
                        />
                    </Grid>
                </Grid>
            </Box>
            <ModuleManager fields={<ModuleTemplateFields calculateTTC={recalculateTTC} />} isTemplate={true} />
        </>
    )
}

export default ProjectTemplateFields;