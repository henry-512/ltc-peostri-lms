import { makeStyles } from "@material-ui/core";
import { Create, useTranslate } from "react-admin";
import Stepper from "../../../components/stepper/Stepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import validateProject from "../validation";

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
          color: theme.palette.text.primary,
          marginBottom: '.25rem'
     },
     alignCenter: {
          alignItems: 'center'
     }
}));

export default function ProjectCreate(props: any) {
     const translate = useTranslate();
     const classes = useStyles();
     const search = new URLSearchParams(props.location.search);

     const transform = (data: any) => {
          delete data.auto_assign;
          data.comments = [];

          return {
               ...data
          }
     }

     return (
          <Create title={translate('project.title')} {...props} transform={transform}>
               <Stepper validate={validateProject}>

                    <General classes={classes} title={translate('project.steps.general')} style={{ width: "100%" }} isTemplate={(typeof search.get('template') == 'string')} validator="general" {...props}/>

                    <Modules classes={classes} title={translate('project.steps.modules')} className={classes.content} validator="modules" {...props}/>

                    {/*<Review classes={classes} title={translate('project.steps.review')} className={classes.content} validator="" {...props}/>*/}
                    
               </Stepper>
          </Create>
     )
}