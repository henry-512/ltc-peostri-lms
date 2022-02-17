import { Button, Card, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, makeStyles, Typography } from "@material-ui/core";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { IModule, ITask, ITaskStep } from "src/util/types";
import Creator from "./Creator";
import TaskFields from "./TaskFields";

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

type TaskCardProps = {
     info?: ITask,
     index?: number,
     stepKey?: string,
     baseSource?: string
}

const TaskCard = ({info, index, stepKey, baseSource}: TaskCardProps) => {
     const translate = useTranslate();
     const classes = useStyles();

     const [open, setOpen] = useState(false);
     const form = useForm();
     const source = `${baseSource}[${stepKey}][${index}]`;

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
     
     return (
          <>
               <Draggable draggableId={"task-" + stepKey + "-" + index || ""} index={index || 0} key={info?.id || ""}>
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
                                   label={translate('project.layout.edit_task', { title: info?.title || "cannot find task" })} 
                                   open={open} 
                                   setOpen={setOpen} 
                                   ariaLabel={"task-update-" + stepKey + "-" + index} 
                                   cancelAction={cancelCreator}
                                   submitAction={submitCreator} 
                                   maxWidth="md"
                              >
                                   <TaskFields getSource={getSource} initialValues={info} />
                              </Creator>
                         </div>               
                    )}
               </Draggable>
          </>
     )
}

export default TaskCard