import { Grid, Typography, makeStyles, Hidden } from "@material-ui/core";
import { ArrayInput, FileField, FileInput, FormDataConsumer, ReferenceArrayInput, ReferenceInput, SelectInput, SimpleFormIterator, TextInput, useTranslate } from "react-admin";
import { AutoAssignArrayInput } from ".";
import { RemoveButton } from "../RemoveButton";
import TaskLabel from "./TaskLabel";
import WaiverInput from "./WaiverInput";
import RichTextInput from 'ra-input-rich-text';
import classNames from "classnames";
import {useEffect, useState} from 'react';
import { generateBase64UUID } from '../../util/uuidProvider';

const BORDER_COLOR = '#e0e0e3';

const something = {
     "0": {
          something: "hello world"
     }
}

const useStyles = makeStyles(theme => ({
     modulesForm: {
          marginTop: '0px'
     },
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
          alignItems: 'center'
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

const IDField = ({source}: {source: string}) => {
     const [id, setID] = useState("");
     useEffect(()=>{
          setID(generateBase64UUID());
     }, [])
     return (
          <Hidden xlDown implementation="css">
               <TextInput source={source} disabled defaultValue={id} initialValue={id}/>
          </Hidden>
     )
}

const Create = (props: any) => {
     const classes = useStyles();
     const translate = useTranslate();
     
     return (
          <>
               <ArrayInput source="modules" label={false} fullWidth className={classes.modulesArrayInput}>
                    <SimpleFormIterator className={classes.modulesForm} disableReordering getItemLabel={(index) => ``} removeButton={<RemoveButton />}>
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
                                                            required
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
                                                       <RichTextInput source={getSource?.('comment') || ""} toolbar={[ ['bold', 'italic', 'underline', 'link'] ]} label="" helperText=" " />
                                                  </Grid>
                                                  <Grid item xs={6} style={{marginTop: '-32px'}}>
                                                       <FileInput source={getSource?.('file') || ""} accept="application/pdf" fullWidth label="" labelSingle="project.create.fields.waiver_file" helperText=" ">
                                                            <FileField source="src" title="title" />
                                                       </FileInput>
                                                  </Grid>
                                             </Grid>
                                             
                                             
                                             <ArrayInput source={getSource?.('tasks') || ""} label={<TaskLabel classes={classes} title={translate('project.create.layout.add_tasks')}/>} className={classes.taskFormWrapper}>
                                                  <SimpleFormIterator className={classes.taskForm} disableReordering getItemLabel={(index) => ``} removeButton={<RemoveButton />}>
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
                                                                                     required
                                                                                     disabled={disableFields}
                                                                                />
                                                                           </Grid>
                                                                           <Grid item xs={4}>
                                                                                <SelectInput 
                                                                                     source={getSource?.('type') || ""} 
                                                                                     choices={[
                                                                                          { id: 'DOCUMENT_UPLOAD', name: 'Upload' },
                                                                                          { id: 'DOCUMENT_REVIEW', name: 'Review' },                                                                                               
                                                                                          { id: 'MODULE_WAIVER', name: 'Waiver', not_available: true },                                                                                               
                                                                                          { id: 'MODULE_WAIVER_APPROVAL', name: 'Waiver Approval', not_available: true },                                                                                               
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
                              }}
                         </FormDataConsumer>
                    </SimpleFormIterator>
               </ArrayInput>
          </>
     )
}    

export default Create;
