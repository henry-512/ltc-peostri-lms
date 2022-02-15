import { Grid, makeStyles, Typography } from "@material-ui/core";
import classNames from "classnames";
import module from "module";
import RichTextInput from "ra-input-rich-text";
import { useEffect, useState } from "react";
import { ArrayInput, FileField, FileInput, FormDataConsumer, maxLength, minLength, required, SelectInput, SimpleFormIterator, TextInput, useTranslate } from "react-admin";
import { useForm } from "react-final-form";
import { TaskArrayInput, WaiverInput } from ".";
import { RemoveButton } from "../buttons/RemoveButton";
import IDField from "./IDField";

const useStyles = makeStyles(theme => ({
     modulesForm: {
          marginTop: '0px'
     },
     modulesArrayInput: {
          marginTop: '10px'
     },
     waiverWrapper: {
          position: 'relative',
          height: '0px',
          transition: 'height 0.3s ease',
          overflow: 'hidden',
     },
     waiverWrapperOpen: {
          transition: 'height 0.3s ease',
          height: '161px',
          marginBottom: '-40px',
          maxHeight: 'unset'
     }
}))

const ModuleArrayInput = (props: any) => {
     const classes = useStyles();
     const translate = useTranslate();
     const form = useForm();
     const validateTitle = [required(), minLength(2), maxLength(150)];
     const [showRemove, setShowRemove] = useState(false);

     const shouldShowRemove = () => {
          const formValue = form.getState().values;
          if (formValue.modules) {
               if (formValue.modules.length > 1) {
                    setShowRemove(true);
                    return;
               }
          }

          if (!formValue.modules) {
               setShowRemove(false);
               return;
          }
               
          if (formValue.modules.length <= 1) {
               setShowRemove(false);
               return;
          }
     }

     useEffect(() => {
          shouldShowRemove();
     })
     
     return (
          <>
               <ArrayInput source="modules" label={false} fullWidth className={classes.modulesArrayInput}>
                    <SimpleFormIterator className={classes.modulesForm} disableReordering getItemLabel={(index) => ``} removeButton={<RemoveButton />} disableRemove={showRemove ? false : true}>
                         <FormDataConsumer>
                              {({ 
                                   formData, // The whole form data
                                   scopedFormData, // The data for this item of the ArrayInput
                                   getSource, // A function to get the valid source inside an ArrayInput
                                   ...rest 
                              }) => {
                                   const moduleInfo = (getSource?.('') || "").split('.')[0].split('[');
                                   const module = moduleInfo[0];
                                   const moduleNumber = moduleInfo[1].replace(']', '');
                              
                                   let showFileUpload = false;

                                   if (typeof formData[module][moduleNumber] != 'undefined' && formData[module][moduleNumber].waived != 'undefined') {
                                        if (formData[module][moduleNumber].waived) {
                                             showFileUpload = true
                                        }
                                   }
                                   return (
                                        <>
                                             <Grid container spacing={2}>
                                                  <IDField source={getSource?.('id') || ""}/>
                                                  <Grid item xs={5}>
                                                       <TextInput 
                                                            source={getSource?.('title') || ""} 
                                                            label="project.create.fields.module_title" 
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
                                                                 { id: 'WAIVED', name: 'WAIVED'},
                                                                 { id: 'ARCHIVED', name: 'ARCHIVED' }
                                                            ]} 
                                                            optionText={choice => `${choice.name}`}
                                                            optionValue="id"
                                                            disabled 
                                                            initialValue="AWAITING" 
                                                            label="project.create.fields.module_status" 
                                                            fullWidth
                                                            helperText=" "
                                                       />
                                                  </Grid>

                                                  <Grid item xs={1}></Grid>

                                                  <Grid item xs={2} style={{
                                                       display: 'flex',
                                                       alignItems: 'center',
                                                       justifyContent: 'center'
                                                  }}>
                                                       <WaiverInput source={getSource?.('waive_module') || ""} />
                                                  </Grid>
                                             </Grid>

                                             <Grid container spacing={4} className={classNames(classes.waiverWrapper, {
                                                  [classes.waiverWrapperOpen]: showFileUpload
                                             })}>
                                                  <Grid item xs={12}>
                                                       <Typography variant="h6">
                                                            {translate('project.create.layout.waive_help')}
                                                       </Typography>
                                                  </Grid>
                                                  <Grid item xs={6} style={{marginTop: '-32px'}}>
                                                       <RichTextInput source={getSource?.('comment') || ""} toolbar={[ ['bold', 'italic', 'underline'] ]} label="" helperText=" " />
                                                  </Grid>
                                                  <Grid item xs={6} style={{marginTop: '-32px'}}>
                                                       <FileInput source={getSource?.('file') || ""} accept="application/pdf" fullWidth label="" labelSingle="project.create.fields.waiver_file" helperText=" ">
                                                            <FileField source="src" title="title" />
                                                       </FileInput>
                                                  </Grid>
                                             </Grid>
                                             <TaskArrayInput source={getSource?.('tasks') || ""}/>
                                        </>
                                   )
                              }}
                         </FormDataConsumer>
                    </SimpleFormIterator>
               </ArrayInput>
          </>
     )
}

export default ModuleArrayInput;
