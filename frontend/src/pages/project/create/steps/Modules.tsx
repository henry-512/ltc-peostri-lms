import { Grid, makeStyles, Typography } from "@material-ui/core";
import { ArrayInput, AutocompleteArrayInput, FormDataConsumer, ReferenceArrayInput, ReferenceInput, SelectInput, SimpleFormIterator, TextInput, useReferenceArrayInputContext, useTranslate } from "react-admin";
import { RemoveButton } from "src/components/RemoveButton";
import { Step } from "src/components/stepper/Step";
import { useForm } from 'react-final-form'

const BORDER_COLOR = '#e0e0e3';

const useStyles = makeStyles(theme => ({
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
          padding: '1rem 1.5rem',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box'
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
     },
     taskFieldWrapper: {
          alignItems: 'center'
     },
     modulesArrayInput: {
          marginTop: '10px'
     }
}));

const AutoAssignArrayInput = (props: any): JSX.Element => {
     const {
          choices, // An array of records matching both the current input value and the filters
          error, // A potential error that may have occured while fetching the data
          warning, // A potential warning regarding missing references 
          loaded, // boolean that is false until the data is available
          loading, // boolean that is true on mount, and false once the data was fetched
          setFilter, // a callback to update the filters, e.g. setFilters({ q: 'query' })
          setPagination, // a callback to change the pagination, e.g. setPagination({ page: 2, perPage: 50 })
          setSort, // a callback to change the sort, e.g. setSort({ field: 'name', order: 'DESC' })
          setSortForList, // a callback to set the sort with the same signature as the one from the ListContext. This is required to avoid breaking backward compatibility and will be removed in v4
     } = useReferenceArrayInputContext(props);

     const form = useForm();
     const formData = form.getState().values;

     console.log(formData)

     const autoAssign = () => {
          if (!formData.auto_assign) return;
          if (!formData.users) return;
          if (!formData[props.mName][props.mID][props.tName][props.tID].usergroup) return;

          choices.forEach((user: any, i: number) => {
               if (user.usergroup.id != formData[props.mName][props.mID][props.tName][props.tID].usergroup) return;
               if (!formData.users.includes(user.id)) return;
               if (typeof formData[props.mName][props.mID][props.tName][props.tID].users != 'undefined' && formData[props.mName][props.mID][props.tName][props.tID].users.includes(user.id)) return;

               form.change(`${props.mName}[${props.mID}].${props.tName}[${props.tID}].users`, [...(formData[props.mName][props.mID][props.tName][props.tID].users || []), user.id]);
               console.log(form.getState().values);
          })
     }

     autoAssign();

     return (
          <>
               <AutocompleteArrayInput
                    optionText={choice => `${choice.firstName} ${choice.lastName}`}
                    optionValue="id"
                    helperText=" "
                    fullWidth
                    {...props}
               />
          </>
     )
}


const Modules = (props: any) => {
const translate = useTranslate();
const classes = useStyles();

const TaskLabel = (props: any) => (
     <Typography variant="h6" className={classes.taskTitle}>
          {translate('project.create.layout.add_tasks')}
     </Typography>
)

return (
     <>
          <Step>
               <Grid container spacing={0} className={props.classes.content}>
                    <Grid item xs={12} className={classes.moduleForm}>
                         <Grid container>
                              <Grid item xs={6} className={props.classes.usersTitle}>
                                   <Typography variant="h6" className={props.classes.fieldTitle}>
                                        {translate('project.create.layout.add_modules')}
                                   </Typography>
                              </Grid>
                         </Grid>
                         <Grid container spacing={2}>
                              <Grid item xs={12}>
                                   <ArrayInput source="modules" label={false} fullWidth className={classes.modulesArrayInput}>
                                        <SimpleFormIterator className={classes.modulesForm} disableReordering getItemLabel={(index) => ``} removeButton={<RemoveButton />}>
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
                                                                      <SimpleFormIterator className={classes.taskForm} disableReordering  getItemLabel={(index) => ``} removeButton={<RemoveButton />}>
                                                                           <FormDataConsumer>
                                                                                {(props: any) => {
                                                                                     var { 
                                                                                          formData, // The whole form data
                                                                                          scopedFormData, // The data for this item of the ArrayInput
                                                                                          getSource, // A function to get the valid source inside an ArrayInput
                                                                                          source,
                                                                                          id,
                                                                                          ...rest 
                                                                                     } = props;
                                                                                     return (
                                                                                          <Grid container spacing={4} className={classes.taskFieldWrapper}>
                                                                                               <Grid item xs={5}>
                                                                                                    <TextInput 
                                                                                                         source={getSource?.('title') || ""} 
                                                                                                         label="project.create.fields.task_title"
                                                                                                         fullWidth
                                                                                                         helperText=" "
                                                                                                         required
                                                                                                    />
                                                                                               </Grid>
                                                                                               <Grid item xs={4}>
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
                                                                                                    var [ mSplit, tSplit ] = (id || '').split('.');
                                                                                                    var [ mName, mID ] = mSplit.replace(']', '').split('[')
                                                                                                    var [ tName, tID ] = tSplit.replace(']', '').split('[')

                                                                                                    if (typeof formData[mName][mID] == 'undefined') return (<></>)

                                                                                                    if (typeof formData[mName][mID][tName][tID] != 'undefined') {
                                                                                                         return (
                                                                                                              <>
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
                                                                                                                             initialValue={(formData[mName][mID][tName][tID]['type'] != 'MODULE_COMPLETE') ? "AWAITING" : 'COMPLETED'} 
                                                                                                                             label="project.create.fields.task_status" 
                                                                                                                             fullWidth
                                                                                                                             helperText=" "
                                                                                                                        />
                                                                                                                   </Grid>

                                                                                                                   <Grid item xs={3} style={{marginTop: '-32px'}}>
                                                                                                                        <ReferenceInput 
                                                                                                                             label="project.create.fields.usergroup"
                                                                                                                             reference="usergroups"
                                                                                                                             source={getSource?.('usergroup') || ""}
                                                                                                                        >
                                                                                                                             <SelectInput
                                                                                                                                  optionText={choice => `${choice.name}`}
                                                                                                                                  optionValue="id"
                                                                                                                                  helperText=" "
                                                                                                                                  fullWidth
                                                                                                                             />
                                                                                                                        </ReferenceInput>
                                                                                                                   </Grid>

                                                                                                                   <Grid item xs={9} style={{marginTop: '-32px'}}>
                                                                                                                        <ReferenceArrayInput
                                                                                                                             label="project.create.fields.member"
                                                                                                                             reference="users"
                                                                                                                             source={getSource?.('users') || ""}
                                                                                                                        >
                                                                                                                             <AutoAssignArrayInput mName={mName} mID={mID} tName={tName} tID={tID} />
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
     </>
)}

export default Modules