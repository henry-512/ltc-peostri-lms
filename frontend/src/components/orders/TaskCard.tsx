import { Card, makeStyles, Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { ITask } from "src/util/types";

const useStyles = makeStyles(theme => ({
     root: {
         marginBottom: theme.spacing(1),
     },
     cardContent: {
         padding: theme.spacing(1),
         display: 'flex',
     },
     cardText: {
         marginLeft: theme.spacing(1),
     },
}));

type TaskCardProps = {
     info?: ITask,
     index?: number,
     stepKey?: string
}

const TaskCard = ({info, index, stepKey}: TaskCardProps) => {
     const translate = useTranslate();
     const classes = useStyles();
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
                              >    
                                   <div className={classes.cardContent}>
                                        <div className={classes.cardText}>
                                             <Typography variant="body2" gutterBottom>
                                                  {info?.title}
                                             </Typography>
                                        </div>
                                   </div>
                              </Card>
                         </div>
                    )}
               </Draggable>
          </>
     )
}

export default TaskCard