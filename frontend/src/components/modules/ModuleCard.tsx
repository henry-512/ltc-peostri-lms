import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, Typography } from "@material-ui/core";
import get from "lodash.get";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { IModule, ITaskStep } from "src/util/types";
import Creator from "./Creator";
import ModuleFields from "./ModuleFields";

const useStyles = makeStyles(theme => ({
     root: {
         marginBottom: theme.spacing(1),
     },
     cardContent: {
         padding: theme.spacing(1),
         display: 'flex',
         flexDirection: 'column'
     },
     cardText: {
         marginLeft: theme.spacing(1),
     }
}));
type ModuleCardProps = {
     steps?: any,
     info?: IModule,
     index?: number,
     stepKey?: string,
     subSteps?: ITaskStep,
     getSource?: string,
     fixKey: Function
}

const ModuleCard = ({steps, info, index, stepKey, subSteps, fixKey}: ModuleCardProps) => {
     const translate = useTranslate();
     const classes = useStyles();

     const [open, setOpen] = useState(false);
     const form = useForm();
     const source = `modules[${stepKey}][${index}]`;

     const handleClickOpen = () => {
          setOpen(true);
     }

     const cancelCreator = () => {
          return;
     }

     const submitCreator = () => {
          return;
     }

     const getSource = (key?: string) => {
          if (key) return `${source}.${key}`.toString();
          return source.toString();
     }

     const deleteCreator = () => {
          let modules = get(form.getState().values, `modules[${stepKey}]`);
          modules.splice(index, 1);
          form.change(`modules[${stepKey}]`, modules);

          if (modules.length <= 0) {
               fixKey(stepKey?.split('-')[1]);
          }
     }
     
     return (
          <>
               <Draggable draggableId={"module-" + stepKey + "-" + index || ""} index={index || 0} key={info?.id || ""}>
                    {(provided, snapshot) => (
                         <div
                              className={classes.root}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                         >
                              <Card
                                   style={{
                                        opacity: snapshot.isDragging ? 0.9 : 1,
                                        transform: snapshot.isDragging
                                             ? 'rotate(-2deg)'
                                             : '',
                                   }}
                                   elevation={snapshot.isDragging ? 3 : 1}
                                   onClick={handleClickOpen}
                              >    
                                   <div className={classes.cardContent}>
                                        <div className={classes.cardText}>
                                             <Typography variant="body2" gutterBottom>
                                                  {info?.title}
                                             </Typography>
                                        </div>
                                   </div>
                              </Card>
                              <Creator 
                                   label={translate('project.layout.edit_module', { title: info?.title || "cannot find module" })} 
                                   open={open} 
                                   setOpen={setOpen} 
                                   ariaLabel={"module-update-" + stepKey + "-" + index} 
                                   cancelAction={cancelCreator}
                                   submitAction={submitCreator} 
                                   deleteAction={deleteCreator}
                              >
                                   <ModuleFields getSource={getSource} initialValues={info} />
                              </Creator>
                         </div>               
                    )}
               </Draggable>
          </>
     )
}

export default ModuleCard