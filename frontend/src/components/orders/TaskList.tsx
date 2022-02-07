import { Box, makeStyles, Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { TaskCard } from ".";
import { ITask } from "../../../../lms/types";

const useStyles = makeStyles(theme => ({
     root: {
          flex: 1,
          paddingTop: 8,
          paddingBottom: 16,
          backgroundColor: '#eaeaee',
          '&:first-child': {
              paddingLeft: 5,
              borderTopLeftRadius: 5,
          },
          '&:last-child': {
              paddingRight: 5,
              borderTopRightRadius: 5,
          },
     },
     droppable: {
          display: 'flex',
          borderRadius: 5,
          padding: 5,
          width: '100%',
          '&.isDraggingOver': {
              backgroundColor: '#dadadf',
          },
     },
}))

type TaskListProps = {
     tasks: ITask[]
}

const TaskList = ({tasks}: TaskListProps) => {
const translate = useTranslate();
const classes = useStyles();

const onDragEnd: OnDragEndResponder = async result => {
     const { destination, source, draggableId } = result;

     if (!destination) {
          return;
     }

     if (
          destination.droppableId === source.droppableId &&
          destination.index === source.index
     ) {
          return;
     }
}

return (
     <>
          {/**/}<DragDropContext onDragEnd={onDragEnd} >
               <Box display="flex" flexDirection="column" width="100%">
                    <div className={classes.root}>
                         <Typography align="center" variant="subtitle1">
                              Unorganized
                         </Typography>
                         <Droppable droppableId='tasks-unorganized' direction="horizontal">
                              {(droppableProvided, snapshot) => (
                                   <div ref={droppableProvided.innerRef}
                                        {...droppableProvided.droppableProps}
                                        className={
                                             classes.droppable + (snapshot.isDraggingOver ? 'isDraggingOver' : '')
                                        }
                                   >
                                        {tasks.map((task: ITask, index: number) => (
                                             <TaskCard task={task} index={index}/>
                                        ))}
                                   </div>
                              )}
                         </Droppable>
                    </div>
               </Box>
          </DragDropContext>{/**/}
     </>
)}

export default TaskList