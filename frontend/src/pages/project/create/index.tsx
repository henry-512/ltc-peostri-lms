import { Box, Grid, makeStyles, Typography } from "@material-ui/core";
import { ArrayInput, AutocompleteArrayInput, BooleanInput, Create, DateInput,  FormDataConsumer,  ReferenceArrayInput,  SelectInput,  SimpleForm,  SimpleFormIterator,  TextInput, useTranslate } from "react-admin";
import Stepper from "../../../components/stepper/Stepper";
import General from "./steps/General";
import Modules from "./steps/Modules";
import Order from "./steps/Order";
import Review from "./steps/Review";

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
     }
}));

export default function ProjectCreate(props: any) {
     const translate = useTranslate();
     const classes = useStyles();

     return (
          <Create title={translate('project.create.title')} {...props}>
               <Stepper>

                    <General classes={classes} title={translate('project.create.steps.general')} style={{ width: "100%" }} {...props}/>

                    <Modules classes={classes} title={translate('project.create.steps.modules')} className={classes.content} {...props}/>

                    <Order classes={classes} title={translate('project.create.steps.order')} className={classes.content} {...props}/>

                    <Review classes={classes} title={translate('project.create.steps.review')} className={classes.content} {...props}/>
                    
               </Stepper>
          </Create>
     )
}