import { Grid, Typography } from "@material-ui/core"
import { AutocompleteArrayInput, BooleanInput, DateInput, ReferenceArrayInput, TextInput, useTranslate } from "react-admin"
import { Step } from "src/components/stepper/Step"

const General = (props: any) => {
const translate = useTranslate();
return (
          <Step>
               <Grid container spacing={0} className={props.classes.content}>
                    <Grid item xs={12}>
                         <Grid container>
                              <Grid item xs={6} className={props.classes.usersTitle}>
                                   <Typography variant="h6" className={props.classes.fieldTitle}>
                                        {translate('project.create.layout.general')}
                                   </Typography>
                              </Grid>
                         </Grid>
                         <Grid container spacing={2}>
                              <Grid item xs={6}>
                                   <TextInput 
                                        label={translate('project.create.fields.title')} 
                                        source="title" 
                                        required
                                        fullWidth
                                        helperText=" "
                                   />
                              </Grid>
                              <Grid item xs={3}>
                                   <DateInput 
                                        label={translate('project.create.fields.start')} 
                                        source="startDate"
                                        required
                                        fullWidth
                                        helperText=" "
                                   />
                              </Grid>
                              <Grid item xs={3}>
                                   <DateInput 
                                        label={translate('project.create.fields.end')} 
                                        source="endDate" 
                                        required
                                        fullWidth
                                        helperText=" "
                                   />
                              </Grid>
                         </Grid>
                    </Grid>
                    <Grid item xs={12} className={props.classes.content}>
                         <Grid container>
                              <Grid item xs={6} className={props.classes.usersTitle}>
                                   <Typography variant="h6" className={props.classes.fieldTitle}>
                                        {translate('project.create.layout.assign')}
                                   </Typography>
                              </Grid>
                              <Grid item xs={6}>
                                   <Grid container xs={12} justifyContent="flex-end">
                                        <BooleanInput label="project.create.layout.auto_assign" source="auto_assign" helperText=" " />
                                   </Grid>
                              </Grid>
                         </Grid>
                         <Grid container>
                              <ReferenceArrayInput
                                   label="project.create.fields.member"
                                   reference="users"
                                   source="users"
                              >
                                   <AutocompleteArrayInput
                                        optionText={choice => `${choice.firstName} ${choice.lastName}`}
                                        optionValue="_id"
                                        helperText=" "
                                        fullWidth
                                   />
                              </ReferenceArrayInput>
                         </Grid>
                    </Grid>
               </Grid>
          </Step>
)}

export default General