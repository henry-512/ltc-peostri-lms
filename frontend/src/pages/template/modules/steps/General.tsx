/**
* @file Template Module Form Step General
* @module TemplateModuleFormStepGeneral
* @category TemplateModulesPage
* @author Braden Cariaga
*/

import { Box, Grid } from "@mui/material"
import { FormGroupContextProvider, maxLength, minLength, required, SelectInput, TextInput } from "react-admin"
import SectionTitle from "src/components/SectionTitle";
import IDField from "src/components/IDField";
import { Step } from "src/components/FormStepper/Step";

export type ModuleTemplateGeneralStepProps = {
    validator: string
    getSource?: Function
    defaultValues?: any
}

const General = (props: ModuleTemplateGeneralStepProps) => {
    const { getSource, validator, defaultValues, ...rest } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];

    return (
        <Step validator={props.validator} {...rest}>
            <FormGroupContextProvider name={props.validator}>
                <Box display="flex" width="100%" flexDirection="column" style={{
                    marginTop: '1rem'
                }}>
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
                                validate={[required()]}
                                emptyValue={null}
                                emptyText={<></>}
                                label="template.module.fields.status"
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
                </Box>
            </FormGroupContextProvider>
        </Step>
    )
}

export default General