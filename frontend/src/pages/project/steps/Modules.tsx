import { Grid, makeStyles, Typography } from "@material-ui/core";
import { FormGroupContextProvider, useTranslate } from "react-admin";
import { Modules as ModuleCreate } from "src/components/modules";
import { Step } from "src/components/stepper/Step";

const BORDER_COLOR = '#e0e0e3';

const useStyles = makeStyles(theme => ({
     moduleForm: {
          border: '1px solid ' + BORDER_COLOR,
          borderTopRightRadius: 5,
          borderTopLeftRadius: 5,
          padding: '1rem 1.5rem'
     }
}));

const Modules = (props: any) => {
const translate = useTranslate();
const classes = useStyles();

return (
     <>
          <Step validator={props.validator} {...props}>
               <FormGroupContextProvider name={props.validator}>
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
               </FormGroupContextProvider>
          </Step>
     </>
)}

export default Modules