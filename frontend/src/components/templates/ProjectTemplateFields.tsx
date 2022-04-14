import { Box, Grid } from "@mui/material";
import { maxLength, minLength, required, SelectInput, TextInput } from "react-admin";
import { IModuleTemplate } from "src/util/types";
import { SectionTitle } from "src/components/misc";
import ModuleManager from "src/packages/ModuleManager";
import ModuleTemplateFields from "./ModuleTemplateFields";
import { useFormContext } from "react-hook-form";

export type ProjectTemplateFieldsProps = {

}

const ProjectTemplateFields = (props: ProjectTemplateFieldsProps) => {
    const validateTitle = [required(), minLength(2), maxLength(150)];

    const { getValues, setValue } = useFormContext();

    const recalculateTTC = () => {
        const modules = getValues('modules');
        if (!modules) return;

        let project_ttc = 0;
        for (let [stepKey, step] of Object.entries<IModuleTemplate[]>(modules)) {
            let stepTTC: number = 0;
            for (let [moduleKey, module] of Object.entries<IModuleTemplate>(step)) {
                if (parseInt(module.ttc) < stepTTC) continue;
                stepTTC = parseInt(module.ttc);
            }
            project_ttc += stepTTC;
        }

        if (project_ttc == getValues('ttc')) return;

        setValue('ttc', project_ttc);
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
                            defaultValue="AWAITING"
                            label="template.project.fields.status"
                            validate={[required()]}
                            emptyValue={null}
                            emptyText={<></>}
                            fullWidth
                            helperText=" "
                        />
                    </Grid>
                    
                    <Grid item xs={3}>
                        <TextInput
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