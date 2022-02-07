import { Box, makeStyles } from '@material-ui/core';
import { useState } from 'react';
import { DragDropContext, OnDragEndResponder } from 'react-beautiful-dnd';
import { ModuleList } from '.';
import { IModule } from '../../../../lms/types';

const BORDER_COLOR = "#e0e0e3"

const useStyles = makeStyles(theme => ({
     root: {
          marginTop: '1rem'
     }
}))

const setUpSteps = (modules: IModule[]): any => {
     

     return 
}

const OrderContent = (props: any) => {
     const {formData, getSource, ...rest} = props;
     const classes = useStyles();

     const [modules, setModules] = useState({
          modules: formData.modules
     });

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

          if (source.droppableId != destination.droppableId) return;
     }
     
     return (
          <>
               <DragDropContext onDragEnd={onDragEnd} >
                    <Box display="flex" flexDirection="column" className={classes.root}>
                         <ModuleList
                              modules={modules}
                         />
                    </Box>
               </DragDropContext>
          </>
     )
}

export default OrderContent;