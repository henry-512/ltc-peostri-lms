import { Grid, makeStyles, Typography } from "@material-ui/core";
import { AutocompleteArrayInput, BooleanInput, Create, DateInput,  ReferenceArrayInput,  TextInput, useTranslate } from "react-admin";
import { Step } from "./Step";
import Stepper from "./Stepper";

const useStyles = makeStyles(theme => ({
     root: {},
     content: {
          marginTop: theme.spacing(1)
     },
     suggestionsContainer: {
          width: '100%'
     }
}));

export default function ProjectCreate(props: any) {
     const translate = useTranslate();
     const classes = useStyles();

     return (
          <Create title={translate('project.create.title')} {...props}>
               <Stepper>
                    <Step title={translate('project.create.steps.general')} style={{ width: "100%" }}>
                         <Grid container spacing={0} className={classes.content}>
                              <Grid item xs={12}>
                                   <Typography variant="h6">
                                        {translate('project.create.layout.general')}
                                   </Typography>
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
                              <Grid item xs={12}>
                                   <Grid container>
                                        <Grid item xs={6}>
                                             <Typography variant="h6">
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
                                             fullWidth
                                        >
                                             <AutocompleteArrayInput
                                                  optionText={choice => `${choice.firstName} ${choice.lastName}`}
                                                  optionValue="_id"
                                                  helperText=" "
                                                  fullWidth
                                                  className={classes.suggestionsContainer}
                                             />
                                        </ReferenceArrayInput>
                                   </Grid>
                              </Grid>
                         </Grid>
                    </Step>

                    <Step title={translate('project.create.steps.modules')} >
                         <DateInput label={translate('project.create.fields.end')} source="end" />
                    </Step>
               </Stepper>
          </Create>
     )
}