import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, Typography } from "@material-ui/core";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { IModule, ITaskStep } from "src/util/types";
import { TaskCard } from ".";
import Steps from "../steps";

const BORDER_COLOR = '#e0e0e3';

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

const useDialogStyles = makeStyles(theme => ({
     root: {
          margin: 0,
          padding: theme.spacing(2),
          borderBottom: '1px solid ' + BORDER_COLOR
     }
}));

const useDialogContentStyles = makeStyles((theme) => ({
     root: {
       padding: theme.spacing(2),
       paddingTop: 0
     }
}));

const useDialogActionsStyles = makeStyles((theme) => ({
     root: {
          margin: 0,
          padding: theme.spacing(2),
          borderTop: '1px solid ' + BORDER_COLOR,
          display: 'flex',
          justifyContent: 'space-between'
     }
}));

type ModuleCardProps = {
     steps?: any,
     info?: IModule,
     index?: number,
     stepKey?: string,
     subSteps?: ITaskStep
}

const ModuleCard = ({steps, info, index, stepKey, subSteps}: ModuleCardProps) => {
     const translate = useTranslate();
     const classes = useStyles();
     const dialogStyles = useDialogStyles();
     const dialogActionStyles = useDialogActionsStyles();
     const dialogContentStyles = useDialogContentStyles();

     const [open, setOpen] = useState(false);
     const form = useForm();

     const updateModuleStep = (newSteps: any) => {
          steps[stepKey || 0][index || 0].steps = newSteps
          form.change(`steps`, steps);
          console.log(form.getState().values);
     }

     const handleClickOpen = () => {
          setOpen(true);
     };

     const handleClose = () => {
          setOpen(false);
     };

     return (
          <>
               <Draggable draggableId={info?.id || ""} index={index || 0} key={info?.id || ""}>
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
                              <Dialog open={open} onClose={handleClose} aria-labelledby={"task-ordering-" + index} fullWidth={true} maxWidth="lg">
                                   <DialogTitle id={"task-ordering-" + index} classes={dialogStyles}>Ordering Tasks for Module: {info?.title}</DialogTitle>
                                   <DialogContent classes={dialogContentStyles}>
                                        <Steps title={translate('project.create.layout.order_tasks')} help={translate('project.create.layout.order_tasks_help')} ogSteps={subSteps} changeOnAction={false} updateForm={updateModuleStep}>
                                             <TaskCard />
                                        </Steps>
                                   </DialogContent>
                                   <DialogActions classes={dialogActionStyles}>
                                        <Button onClick={handleClose} color="primary">
                                             Cancel
                                        </Button>
                                        <Button onClick={handleClose} color="primary">
                                             Save
                                        </Button>
                                   </DialogActions>
                              </Dialog>
                         </div>               
                    )}
               </Draggable>
          </>
     )
}

export default ModuleCard