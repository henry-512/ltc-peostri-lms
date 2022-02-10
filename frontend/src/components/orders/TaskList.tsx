import { Box, makeStyles, Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { TaskCard } from ".";
import { ITask, ITaskStep } from "src/util/types";

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

const TaskList = ({tasks}: {tasks: ITaskStep}) => {
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
          
     </>
)}

export default TaskList