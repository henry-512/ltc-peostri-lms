import { Box, Grid, makeStyles, Typography } from "@material-ui/core";
import { ArrayInput, AutocompleteArrayInput, BooleanInput, Create, DateInput,  FormDataConsumer,  ReferenceArrayInput,  SelectInput,  SimpleForm,  SimpleFormIterator,  TextInput, useTranslate } from "react-admin";
import { Step } from "./Step";
import Stepper from "./Stepper";

const BORDER_COLOR = '#e0e0e3';

const useStyles = makeStyles(theme => ({
     root: {},
     content: {
          marginTop: theme.spacing(2)
     },
     usersTitle: {
          display: 'flex', 
          alignItems: 'center'
     },
     taskBox: {
          font: 'inherit'
     },
     fieldTitle: {
          borderBottom: '2px solid ' + theme.palette.primary.main,
          paddingBottom: '.25rem',
          lineHeight: '1',
          color: theme.palette.text.primary
     },
     moduleForm: {
          border: '1px solid ' + BORDER_COLOR,
          borderRadius: '1rem 1rem 0 0',
          padding: '1rem 1.5rem'
     },
     modulesForm: {
          marginTop: '0px'
     },
     taskFormWrapper: {
          border: '1px solid ' + BORDER_COLOR,
          borderRadius: '1rem 1rem 0 0',
          padding: '1rem 1.5rem'
     },
     taskForm: {
          marginTop: '1.75rem'
     },
     taskTitle: {
          position: 'absolute',
          width: 'auto',
          display: 'inline-block',
          top: '1rem',
          left: '1.5rem',
          fontSize: '1.4rem',
          borderBottom: '2px solid ' + theme.palette.primary.main,
          paddingBottom: '.25rem',
          lineHeight: '1',
          color: theme.palette.text.primary,
          whiteSpace: 'nowrap'
     }
}));

export default function ProjectCreate(props: any) {
     const translate = useTranslate();
     const classes = useStyles();

     const TaskLabel = (props: any) => (
          <Typography variant="h6" className={classes.taskTitle}>
               {translate('project.create.layout.add_tasks')}
          </Typography>
     )

     return (
          <Create title={translate('project.create.title')} {...props}>
               <Stepper>
                    <Step title={translate('project.create.steps.general')} style={{ width: "100%" }}>
                         <Grid container spacing={0} className={classes.content}>
                              <Grid item xs={12}>
                                   <Grid container>
                                        <Grid item xs={6} className={classes.usersTitle}>
                                             <Typography variant="h6" className={classes.fieldTitle}>
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
                              <Grid item xs={12} className={classes.content}>
                                   <Grid container>
                                        <Grid item xs={6} className={classes.usersTitle}>
                                             <Typography variant="h6" className={classes.fieldTitle}>
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

                    <Step title={translate('project.create.steps.modules')} className={classes.content} >
                         <Grid container spacing={0} className={classes.content}>
                              <Grid item xs={12} className={classes.moduleForm}>
                                   <Grid container>
                                        <Grid item xs={6} className={classes.usersTitle}>
                                             <Typography variant="h6" className={classes.fieldTitle}>
                                                  {translate('project.create.layout.add_modules')}
                                             </Typography>
                                        </Grid>
                                   </Grid>
                                   <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                             <ArrayInput source="modules" label={false} fullWidth>
                                                  <SimpleFormIterator className={classes.modulesForm}>
                                                       <FormDataConsumer>
                                                            {({ 
                                                                 formData, // The whole form data
                                                                 scopedFormData, // The data for this item of the ArrayInput
                                                                 getSource, // A function to get the valid source inside an ArrayInput
                                                                 ...rest 
                                                            }) => {
                                                                 return (
                                                                      <>
                                                                           <Grid container spacing={2}>
                                                                                <Grid item xs={5}>
                                                                                     <TextInput 
                                                                                          source={getSource?.('title') || ""} 
                                                                                          label="project.create.fields.module_title" 
                                                                                          fullWidth
                                                                                          helperText=" "
                                                                                          required
                                                                                     />
                                                                                </Grid>

                                                                                <Grid item xs={3}></Grid>
                                                                                
                                                                                <Grid item xs={3}>
                                                                                     <SelectInput 
                                                                                          source={getSource?.('status') || ""} 
                                                                                          choices={[
                                                                                               { id: 'AWAITING', name: 'AWAITING' },
                                                                                               { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                                                                                               { id: 'COMPLETED', name: 'COMPLETED' },
                                                                                               { id: 'ARCHIVED', name: 'ARCHIVED' }
                                                                                          ]} 
                                                                                          disabled 
                                                                                          initialValue="AWAITING" 
                                                                                          label="project.create.fields.module_status" 
                                                                                          fullWidth
                                                                                          helperText=" "
                                                                                     />
                                                                                </Grid>

                                                                                <Grid item xs={1}></Grid>
                                                                           </Grid>
                                                                           <ArrayInput source={getSource?.('tasks') || ""} label={<TaskLabel />} className={classes.taskFormWrapper}>
                                                                                <SimpleFormIterator className={classes.taskForm}>
                                                                                     <FormDataConsumer>
                                                                                          {(props: any) => {
                                                                                               var { 
                                                                                                    formData, // The whole form data
                                                                                                    scopedFormData, // The data for this item of the ArrayInput
                                                                                                    getSource, // A function to get the valid source inside an ArrayInput
                                                                                                    id,
                                                                                                    ...rest 
                                                                                               } = props;
                                                                                               return (
                                                                                                    <Grid container spacing={4}>
                                                                                                         <Grid item xs={3}>
                                                                                                              <SelectInput 
                                                                                                                   source={getSource?.('type') || ""} 
                                                                                                                   choices={[
                                                                                                                        { id: 'DOCUMENT_UPLOAD', name: 'Upload Document' },
                                                                                                                        { id: 'DOCUMENT_REVIEW', name: 'Review Document' },
                                                                                                                        { id: 'MODULE_COMPLETE', name: 'Complete Module' }
                                                                                                                   ]}  
                                                                                                                   label="project.create.fields.task_type" 
                                                                                                                   fullWidth
                                                                                                                   helperText=" "
                                                                                                                   required
                                                                                                              />
                                                                                                         </Grid>

                                                                                                         
                                                                                                              {(() => {
                                                                                                                   var [ mSplit, tSplit ] = id.split('.');
                                                                                                                   var [ mName, mID ] = mSplit.replace(']', '').split('[')
                                                                                                                   var [ tName, tID ] = tSplit.replace(']', '').split('[')
                                                                                                                   if (formData[mName][mID][tName][tID]) {
                                                                                                                        console.log(formData[mName][mID][tName][tID]);
                                                                                                                        return (
                                                                                                                             <>
                                                                                                                                  <Grid item xs={5}>
                                                                                                                                       <TextInput 
                                                                                                                                            source={getSource?.('title') || ""} 
                                                                                                                                            label="project.create.fields.task_title"
                                                                                                                                            fullWidth
                                                                                                                                            helperText=" "
                                                                                                                                            required
                                                                                                                                       />
                                                                                                                                  </Grid>
                                                                                                                                  
                                                                                                                                  <Grid item xs={1}></Grid>
                                                                                                         
                                                                                                                                  <Grid item xs={3}>
                                                                                                                                       <SelectInput 
                                                                                                                                            source={getSource?.('status') || ""} 
                                                                                                                                            choices={[
                                                                                                                                                 { id: 'AWAITING', name: 'AWAITING' },
                                                                                                                                                 { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                                                                                                                                                 { id: 'COMPLETED', name: 'COMPLETED' },
                                                                                                                                                 { id: 'ARCHIVED', name: 'ARCHIVED' }
                                                                                                                                            ]} 
                                                                                                                                            disabled 
                                                                                                                                            initialValue="AWAITING" 
                                                                                                                                            label="project.create.fields.module_status" 
                                                                                                                                            fullWidth
                                                                                                                                            helperText=" "
                                                                                                                                       />
                                                                                                                                  </Grid>

                                                                                                                                  <Grid item xs={12}>
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
                                                                                                                             </>
                                                                                                                        )
                                                                                                                   } else { return (<></>) }
                                                                                                              })()}
                                                                                                    </Grid>
                                                                                               )
                                                                                          }}
                                                                                     </FormDataConsumer>
                                                                                </SimpleFormIterator>
                                                                           </ArrayInput>
                                                                      </>
                                                                 )
                                                            }}
                                                       </FormDataConsumer>
                                                  </SimpleFormIterator>
                                             </ArrayInput>
                                        </Grid>
                                   </Grid>
                              </Grid>
                         </Grid>
                    </Step>
                    <Step title={translate('project.create.steps.review')} className={classes.content}>
                         <FormDataConsumer>
                              {({ 
                                   formData,
                                   scopedFormData,
                                   getSource,
                                   ...rest 
                              }: any) => {
                                   console.log(formData);
                                   return (
                                        <div>

                                        </div>
                                   )
                              }}
                         </FormDataConsumer>
                    </Step>
               </Stepper>
          </Create>
     )
}