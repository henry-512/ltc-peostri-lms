import { Box, Grid } from "@material-ui/core"
import { FormGroupContextProvider, maxLength, minLength, NumberInput, required, SelectInput, TextInput } from "react-admin"
import { SectionTitle } from "src/components/misc";
import IDField from "src/components/modules/IDField";
import { Step } from "src/components/FormStepper/Step"

export type ModuleTemplateGeneralStepProps = {
    validator: string
    getSource?: Function
    initialValues?: any
}

const General = (props: ModuleTemplateGeneralStepProps) => {
    const { getSource, validator, initialValues, ...rest } = props;
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
                </Box>
            </FormGroupContextProvider>
        </Step>
    )
}

export default General