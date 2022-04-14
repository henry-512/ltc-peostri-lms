import { Grid } from "@mui/material"
import { BooleanInput, DateInput, FormGroupContextProvider, NumberInput, ReferenceInput, required, SelectInput, TextInput, useTranslate } from "react-admin"
import { SectionTitle } from "src/components/misc";
import UserInput from "src/components/project/UserInput";
import { Step } from "src/packages/FormStepper/Step"
import { dateFormatter, dateParser } from "src/util/dateFormatter";

const General = (props: any) => {
    const translate = useTranslate();

    return (
        <Step validator={props.validator} {...props}>
            <FormGroupContextProvider name={props.validator}>
                <Grid container spacing={0} className={props.classes.content}>
                    <Grid item xs={12}>
                        <Grid container>
                            <Grid item xs={6} className={props.classes.usersTitle}>
                                <SectionTitle label="project.layout.general" disableGutter />
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextInput
                                    label={translate('project.fields.title')}
                                    source="title"
                                    validate={[required()]}
                                    fullWidth
                                    helperText=" "
                                />
                            </Grid>
                            <Grid item xs={3}>
                                <DateInput
                                    label={translate('project.fields.start')}
                                    format={dateFormatter} 
                                    parse={dateParser}
                                    source="start"
                                    defaultValue={Date.now()}
                                    required
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
                    </Grid>
                    <Grid item xs={12} className={props.classes.content}>
                        <Grid container className={props.classes.alignCenter}>
                            <Grid item xs={6} className={props.classes.usersTitle}>
                                <SectionTitle label="project.layout.assign" disableGutter />
                            </Grid>
                            <Grid item xs={6}>
                                <Grid container xs={12} justifyContent="flex-end">
                                    <BooleanInput label="project.layout.auto_assign" source="auto_assign" helperText=" " options={{ size: "small" }} defaultValue={false} />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <ReferenceInput
                                    label="project.fields.team"
                                    reference="admin/teams"
                                    source="team"
                                >
                                    <SelectInput 
                                        optionText={choice => `${choice.name}`}
                                        optionValue="id"
                                        helperText=" "
                                        fullWidth
                                        resettable={true}
                                    />
                                </ReferenceInput>
                            </Grid>
                            <Grid item xs={6}>
                                <UserInput />
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </FormGroupContextProvider>
        </Step>
    )
}

export default General