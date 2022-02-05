import { Grid } from "@material-ui/core";
import { useState } from "react";
import { ArrayInput, FormDataConsumer, ReferenceArrayInput, ReferenceInput, SelectInput, SimpleFormIterator, TextInput, useTranslate } from "react-admin";
import { AutoAssignArrayInput } from ".";
import { RemoveButton } from "../RemoveButton";
import TaskLabel from "./TaskLabel";
import WaiverInput from "./WaiverInput";

const Create = (props: any) => {
     const {
          classes,
          ...rest
     } = props;
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
                                             
                                             <ArrayInput source={getSource?.('tasks') || ""} label={<TaskLabel classes={classes} title={translate('project.create.layout.add_tasks')}/>} className={classes.taskFormWrapper}>
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

                                                                 var [ mSplit, tSplit ] = (id || '').split('.');
                                                                 var [ mName, mID ] = mSplit.replace(']', '').split('[');
                                                                 var [ tName, tID ] = tSplit.replace(']', '').split('[');
                                                                 let disableFields = false;

                                                                 if (typeof formData[mName][mID][tName][tID] != 'undefined') {
                                                                      if (typeof formData[mName][mID][tName][tID].type != 'undefined') {
                                                                           if (formData[mName][mID][tName][tID].type == 'MODULE_WAIVER' || formData[mName][mID][tName][tID].type == 'MODULE_WAIVER_APPROVAL') {
                                                                                disableFields = true 
                                                                           }
                                                                      }
                                                                 }
                                                                 return (
                                                                      <Grid container spacing={4} className={classes.taskFieldWrapper}>
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
                                                                                                         optionText={choice => `${choice.name}`}
                                                                                                         optionValue="id"
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
          </>
     )
}    

export default Create;