import { makeStyles, Typography } from '@material-ui/core';
import { Droppable } from 'react-beautiful-dnd';
import { ModuleCard } from '.';
import { IModule } from '../../../../lms/types';

const BORDER_COLOR = "#e0e0e3"

const useStyles = makeStyles(theme => ({
     root: {
          flex: 1,
          paddingTop: 8,
          paddingBottom: 16,
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
          flexDirection: 'column',
          borderRadius: 5,
          padding: 5,
          '&.isDraggingOver': {
              backgroundColor: '#dadadf',
          },
     },
}))

type ModuleListProps = {
     modules: IModule[]
}

const ModuleList = ({modules}: ModuleListProps) => {
     const classes = useStyles();

     return (
          <>
               <div className={classes.root}>
                    <Typography align="center" variant="subtitle1">
                         Drag and Drop the Modules and Tasks in Order
                    </Typography>
                    <Droppable droppableId="module-list">
                         {(droppableProvided, snapshot) => (
                              <div ref={droppableProvided.innerRef}
                                   {...droppableProvided.droppableProps}
                                   className={
                                        classes.droppable + (snapshot.isDraggingOver ? 'isDraggingOver' : '')
                                   }
                              >
                                   {modules.map((module: IModule, index: number) => (
                                        <ModuleCard 
                                             module={module}
                                             key={index}
                                             index={index}
                                        />
                                   ))}
                              </div>
                         )}
                    </Droppable>
               </div>
          </>
     )
}

export default ModuleList;