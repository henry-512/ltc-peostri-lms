import { Grid } from "@material-ui/core";
import React from "react";
import { Create, DateInput, SimpleForm, TextInput, useTranslate } from "react-admin";
import { Step } from "./Step";
import Stepper from "./Stepper";

export default function ProjectCreate(props: any) {
     const translate = useTranslate();

     return (
          <Create title={translate('project.create.title')} {...props}>
               <Stepper>
                    <Step title={translate('project.create.steps.general')} style={{ width: "100%" }}>
                         <Grid container spacing={2}>
                              <Grid item xs={3}>
                                   <TextInput 
                                        label={translate('project.create.fields.title')} 
                                        source="title" 
                                        required
                                        fullWidth
                                   />
                              </Grid>
                              <Grid item xs={2}>
                                   <DateInput 
                                        label={translate('project.create.fields.start')} 
                                        source="startDate"
                                        required
                                        fullWidth
                                   />
                              </Grid>
                              <Grid item xs={2}>
                                   <DateInput 
                                        label={translate('project.create.fields.end')} 
                                        source="endDate" 
                                        required
                                        fullWidth
                                   />
                              </Grid>
                         </Grid>
                    </Step>

                    <Step title={translate('project.create.steps.modules')} optional={true} >
                         <DateInput label={translate('project.create.fields.end')} source="end" />
                    </Step>
               </Stepper>
          </Create>
     )
}