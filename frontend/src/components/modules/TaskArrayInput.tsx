import { Grid, makeStyles } from "@material-ui/core";
import get from "lodash.get";
import { useEffect, useState } from "react";
import { ArrayInput, FormDataConsumer, maxLength, minLength, ReferenceArrayInput, ReferenceInput, required, SelectInput, SimpleFormIterator, TextInput, useTranslate } from "react-admin";
import { useForm } from "react-final-form";
import { AutoAssignArrayInput, TaskLabel } from ".";
import { RemoveButton } from "../buttons/RemoveButton";
import IDField from "./IDField";

const BORDER_COLOR = '#e0e0e3';

const useStyles = makeStyles(theme => ({
     taskFormWrapper: {
          border: '1px solid ' + BORDER_COLOR,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
          padding: '1rem 1.5rem',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          marginTop: '40px'
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
          alignItems: 'flex-start'
     }
}))

const TaskArrayInput = (props: any) => {
     const classes = useStyles();
     const translate = useTranslate();
     const form = useForm();
     const validateTitle = [required(), minLength(2), maxLength(150)];
     const [showRemove, setShowRemove] = useState(false);

     const shouldShowRemove = () => {
          const formValues = form.getState().values;

          console.log(get(formValues, props.source));

          if (get(formValues, props.source)) {
               if (get(formValues, props.source).length > 1) {
                    setShowRemove(true);
                    return;
               }
          }

          if (!get(formValues, props.source) || get(formValues, props.source).length <= 1) {
               setShowRemove(false);
               return;
          }
     }

     const getInitialValues = () => {
          const formValues = form.getState().values;
          let values = get(formValues, props.source);

          if (!values || get(formValues, props.source).length <= 0) {
               values = [{}]
          }

          form.change(props.source, values);
     }

     useEffect(() => {
          getInitialValues();
     }, []);

     useEffect(() => {
          shouldShowRemove();
     })

     return (
          <>
               <ArrayInput source={props.source} label={<TaskLabel classes={classes} title={translate('project.create.layout.add_tasks')}/>} className={classes.taskFormWrapper}>
                    <SimpleFormIterator className={classes.taskForm} disableReordering getItemLabel={(index) => ``} removeButton={<RemoveButton />} disableRemove={showRemove ? false : true}>
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

                                   var [ mSplit, tSplit ] = (id || '').split('.');
                                   var [ mName, mID ] = mSplit.replace(']', '').split('[');
                                   var [ tName, tID ] = tSplit.replace(']', '').split('[');
                                   let disableFields = false;
                                   
                                   if (typeof formData[mName][mID] != 'undefined') {
                                        if (typeof formData[mName][mID][tName] != 'undefined') {
                                             if (typeof formData[mName][mID][tName][tID] != 'undefined') {
                                                  if (typeof formData[mName][mID][tName][tID].type != 'undefined') {
                                                       if (formData[mName][mID][tName][tID].type == 'MODULE_WAIVER' || formData[mName][mID][tName][tID].type == 'MODULE_WAIVER_APPROVAL') {
                                                            disableFields = true 
                                                       }
                                                  }
                                             }
                                        }
                                   }
                                   return (
                                        <Grid container spacing={4} className={classes.taskFieldWrapper}>
                                             <IDField source={getSource?.('id') || ""}/>
                                             <Grid item xs={5}>
                                                  <TextInput 
                                                       source={getSource?.('title') || ""} 
                                                       label="project.create.fields.task_title"
                                                       fullWidth
                                                       helperText=" "
                                                       validate={validateTitle}
                                                       disabled={disableFields}
                                                  />
                                             </Grid>
                                             <Grid item xs={4}>
                                                  <SelectInput 
                                                       source={getSource?.('type') || ""} 
                                                       choices={[
                                                            { id: 'DOCUMENT_UPLOAD', name: translate('tasks.types.document_upload') },
                                                            { id: 'DOCUMENT_REVIEW', name: translate('tasks.types.document_review') },                                                                                              
                                                            { id: 'DOCUMENT_APPROVE', name: translate('tasks.types.document_approve') },                                                                                              
                                                            //{ id: 'MODULE_WAIVER', name: translate('tasks.types.module_waiver'), not_available: true },                                                                                               
                                                            { id: 'MODULE_WAIVER_APPROVAL', name: translate('tasks.types.module_waiver_approval'), not_available: true },                                                                                               
                                                       ]}  
                                                       optionText={choice => `${choice.name}`}
                                                       optionValue="id"
                                                       label="project.create.fields.task_type" 
                                                       fullWidth
                                                       helperText=" "
                                                       required
                                                       disableValue="not_available"
                                                       disabled={disableFields}
                                                  />
                                             </Grid>                                                                                               
                                             {(() => {
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
                                                                      optionText={choice => `${choice.name}`}
                                                                      optionValue="id"
                                                                      disabled 
                                                                      initialValue="AWAITING"
                                                                      label="project.create.fields.task_status" 
                                                                      fullWidth
                                                                      helperText=" "
                                                                 />
                                                            </Grid>

                                                            <Grid item xs={3} style={{marginTop: '-32px'}}>
                                                                 <ReferenceInput 
                                                                      label="project.create.fields.usergroup"
                                                                      reference="userGroups"
                                                                      source={getSource?.('userGroup') || ""}
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
                                             })()}
                                        </Grid>
                                   )
                              }}
                         </FormDataConsumer>
                    </SimpleFormIterator>
               </ArrayInput>
          </>
     )
}

export default TaskArrayInput;