import { Grid, makeStyles, Typography } from "@material-ui/core";
import { ArrayInput, AutocompleteArrayInput, BooleanInput, FormDataConsumer, ReferenceArrayInput, ReferenceInput, SelectInput, SimpleFormIterator, TextInput, useInput, useReferenceArrayInputContext, useTranslate } from "react-admin";
import { ModuleCreate } from "src/components/modules";
import { Step } from "src/components/stepper/Step";
import { useForm } from 'react-final-form'
import { useCallback } from "react";
import { ITask, ITaskWaiver, ITaskWaiverReview } from "../../../../../../lms/types";

const BORDER_COLOR = '#e0e0e3';

const useStyles = makeStyles(theme => ({
     moduleForm: {
          border: '1px solid ' + BORDER_COLOR,
          borderRadius: '1rem 1rem 0 0',
          padding: '1rem 1.5rem'
     }
}));

const Modules = (props: any) => {
const translate = useTranslate();
const classes = useStyles();

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
                                   <ModuleCreate classes={props.classes}/>
                              </Grid>
                         </Grid>
                    </Grid>
               </Grid>
          </Step>
     </>
)}

export default Modules