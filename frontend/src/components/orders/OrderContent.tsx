import { Box, ButtonClassKey, makeStyles, Typography } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import { RemoveCircleOutline } from '@material-ui/icons';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { MouseEventHandler, useState } from 'react';
import { Button, useTranslate } from 'react-admin';
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { ModuleCard } from '.';
import { IModule, IModuleStep, ITask, ITaskStep } from '../../../../lms/types';

const BORDER_COLOR = "#e0e0e3"

const useStyles = makeStyles(theme => ({
     root: {
          marginTop: '1rem'
     },
     subRoot: {
          flex: 1,
          '&:first-child': {
              borderTopLeftRadius: 5,
          },
          '&:last-child': {
              borderTopRightRadius: 5,
          },
          border: '1px solid ' + BORDER_COLOR,
          overflow: 'hidden'
     },
     droppable: {
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 5,
          padding: 5,
          height: '100%',
          minHeight: '50px',
          background: '#f5f5f5',
          '&.isDraggingOver': {
              backgroundColor: '#dadadf',
          },
     },
     toolbar: {
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem',
          boxSizing: 'border-box',
          backgroundColor: '#f5f5f5',
          marginBottom: '1rem'
     },
     orderTitle: {
          borderBottom: '2px solid ' + theme.palette.primary.main,
          paddingBottom: '.25rem',
          lineHeight: '1',
          color: theme.palette.text.primary,
          marginBottom: '.25rem',
          width: 'fit-content'
     },
     sideToolbar: {
          width: '25%'
     },
     stepWrapper: {
          '&:not(:last-child)': {
               borderBottom: '1px solid ' + BORDER_COLOR
          }
     },
     moduleDropper: {
          
     }
}))

const setUpSteps = (modules: IModule[]): IModuleStep => {
     let steps = {} as IModuleStep;
     for (let i = 0; i < modules.length; i++) {
          steps[i] = new Array<IModule>();
          modules[i].steps = {} as ITaskStep;

          for (let j = 0; j < modules[i].tasks.length; j++) {
               modules[i].steps[j] = new Array<ITask>();
               modules[i].steps[j].push(modules[i].tasks[j]);
          }

          steps[i].push(modules[i]);
     }
     return steps;
}

const OrderContent = (props: any) => {
     const {formData, getSource} = props;
     const classes = useStyles();
     const translate = useTranslate();

     const [steps, setSteps] = useState(setUpSteps(formData.modules));

     const addStep = () => {
          setSteps({
               ...steps,
               [Object.keys(steps).length]: new Array<IModule>()
          })
     }

     const removeStep = (key: number | string) => {
          let cacheSteps = steps;
          delete cacheSteps[key];
          setSteps({
               ...cacheSteps
          });
     }

     const AddStepButton = ({label, onClick}: {label: string | undefined, onClick: MouseEventHandler | undefined}) => (
          <Button label={label} onClick={onClick} color="primary" variant="contained">
               <AddCircleOutlineIcon />
          </Button>
     )

     const RemoveStepButton = ({label, onClick}: {label: string | undefined, onClick: MouseEventHandler | undefined}) => (
          <Button label={label} onClick={onClick} color="primary">
               <RemoveCircleOutline />
          </Button>
     )

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

          if (source.droppableId !== destination.droppableId) return;
     }
     
     return (
          <>
               <DragDropContext onDragEnd={onDragEnd} >
                    <Box display="flex" flexDirection="column" className={classes.root}>
                         <div className={classes.subRoot}>
                              <div className={classes.toolbar}>
                                   <Box width="25%">
                                        <Typography variant="h6" className={classes.orderTitle}>
                                             {translate('project.create.layout.order_modules')}
                                        </Typography>
                                   </Box>
                                        <Typography align="center" variant="subtitle1">
                                             {translate('project.create.layout.order_help')}
                                        </Typography>
                                   <Box width="25%" display="flex" justifyContent="flex-end" >
                                        <AddStepButton label="Add Step" onClick={addStep} />
                                   </Box>
                              </div>
                              
                              {Object.keys(steps).map((stepKey, i) => (
                                   <Box display="flex" alignItems="center" className={classes.stepWrapper}>
                                        <Box padding={4}>
                                             <Typography variant="subtitle1">
                                                  {"Step " + (i + 1)}
                                             </Typography>
                                        </Box>
                                        <Droppable droppableId={`step-${stepKey}`}>
                                             {(droppableProvided, snapshot) => (
                                                  <div ref={droppableProvided.innerRef}
                                                       {...droppableProvided.droppableProps}
                                                       className={
                                                            classes.droppable + (snapshot.isDraggingOver ? 'isDraggingOver' : '')
                                                       }
                                                  >
                                                       {steps[stepKey].map((module: IModule, index: number) => (
                                                            <ModuleCard 
                                                                 module={module}
                                                                 key={index}
                                                                 index={index}
                                                            />
                                                       ))}
                                                  </div>
                                             )}
                                        </Droppable>
                                        <Box>
                                             <RemoveStepButton label="" onClick={() => removeStep(stepKey)}/>
                                        </Box>    
                                   </Box>
                              ))}
                         </div>
                    </Box>
               </DragDropContext>
          </>
     )
}

export default OrderContent;