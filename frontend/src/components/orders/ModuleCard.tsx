import { Card, makeStyles, Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { TaskList } from ".";
import { IModule } from "../../../../lms/types";

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
     },
}));

type ModuleCardProps = {
     module: IModule,
     index: number
}

const ModuleCard = ({module, index}: ModuleCardProps) => {
const translate = useTranslate();
const classes = useStyles();

return (
     <>
          <Draggable draggableId={module.id || ""} index={index} key={module.id || ""}>
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
                                             {module.title}
                                        </Typography>
                                   </div>
                                   <TaskList tasks={module.tasks}/>
                              </div>
                         </Card>
                    </div>               
               )}
          </Draggable>
     </>
)}

export default ModuleCard