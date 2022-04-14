import { Box, Grid } from "@mui/material"
import { FormGroupContextProvider, maxLength, minLength, NumberInput, required, SelectInput, TextInput } from "react-admin"
import { SectionTitle } from "src/components/misc";
import { Step } from "src/packages/FormStepper/Step"

export type ProjectTemplateGeneralProps = {
    validator: string
    getSource?: Function
    defaultValues?: any
}

const General = (props: ProjectTemplateGeneralProps) => {
    const { getSource, validator, defaultValues, ...rest } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];

    return (
        <Step validator={props.validator} {...rest}>
            <FormGroupContextProvider name={props.validator}>
                <Box display="flex" width="100%" flexDirection="column" style={{
                    marginTop: '1rem'
                }}>
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
                                validate={[required()]}
                                emptyValue={null}
                                emptyText={<></>}
                                label="template.project.fields.status"
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
            </FormGroupContextProvider>
        </Step>
    )
}

export default General