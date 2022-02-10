import { makeStyles } from "@material-ui/core";
import { Create, useTranslate } from "react-admin";
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
          delete data.modules;
          data.modules = data.steps;
          delete data.steps;
          delete data.auto_assign;
          data.comments = [];
          
          let modKeys = Object.keys(data.modules);
          for (let i = 0; i < modKeys.length; i++) {
               for (let j = 0; j < data.modules[modKeys[i]].length; j++) {
                    delete data.modules[modKeys[i]][j].waive_module;
                    data.modules[modKeys[i]][j].comments = [];

                    if (data.modules[modKeys[i]][j].comment) {
                         data.modules[modKeys[i]][j].comments.push(data.modules[Object.keys(data.modules)[i]][j].comment);
                         delete data.modules[modKeys[i]][j].comment;
                    }

                    delete data.modules[modKeys[i]][j].tasks;
                    data.modules[modKeys[i]][j].tasks = data.modules[modKeys[i]][j].steps;
                    delete data.modules[modKeys[i]][j].steps;

                    /*let taskKeys = Object.keys(data.modules[modKeys[i]][j].tasks);
                    for (let k = 0; j < taskKeys.length; k++) {
                         for (let l = 0; l < data.modules[modKeys[i]][j].tasks[taskKeys[i]].length; l++) {
                              data.modules[modKeys[i]][j].tasks[taskKeys[k]][l]
                         }
                    }*/
               }
          }

          console.log(data);

          return {
               ...data
          }
     }

     return (
          <Create title={translate('project.create.title')} {...props} transform={transform}>
               <Stepper>

                    <General classes={classes} title={translate('project.create.steps.general')} style={{ width: "100%" }} isTemplate={(typeof search.get('template') == 'string')} {...props}/>

                    <Modules classes={classes} title={translate('project.create.steps.modules')} className={classes.content} {...props}/>

                    <Order classes={classes} title={translate('project.create.steps.order')} className={classes.content} {...props}/>

                    <Review classes={classes} title={translate('project.create.steps.review')} className={classes.content} {...props}/>
                    
               </Stepper>
          </Create>
     )
}