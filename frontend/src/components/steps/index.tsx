import { Box, Typography, makeStyles } from "@material-ui/core";
import React, { useEffect } from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { IModule, IModuleStep, ITask, ITaskStep } from "src/util/types";
import AddStepButton from "./AddStepButton";
import RemoveStepButton from "./RemoveStepButton";
import StepMover from "./StepMover";

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
          borderRadius: 5,
          padding: 5,
          height: '100%',
          minHeight: '50px',
          width: '100%',
          background: '#f5f5f5',
          transition: 'all .3s ease',
          '&.isDraggingOver': {
              backgroundColor: '#e0e0e3',
              transition: 'all .3s ease',
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
          
     },
}));

type StepsProps = {
     ogSteps: any,
     title: string,
     help: string,
     children: JSX.Element | JSX.Element[],
     save?: string,
     changeOnAction?: boolean,
     updateForm?: Function
}

const Steps = (props: StepsProps) => {
     const {ogSteps, title, help, children, save, changeOnAction, updateForm} = props;
     const classes = useStyles();

     const [steps, setSteps] = useState(ogSteps);

     const form = useForm();
     useEffect(() => {
          if (!save) return;
          form.change(save || "", ogSteps);
     }, [])

     const changeForm = (newValue?: any) => {
          if (!changeOnAction) {
               if (!updateForm) return;
               return updateForm(newValue);
          }

          console.log(save || "", newValue, form.getState().values)
          form.change(save || "", newValue || steps);
     }

     const addStep = () => {
          setSteps({
               ...steps,
               [Object.keys(steps).length]: new Array()
          });
          changeForm({
               ...steps,
               [Object.keys(steps).length]: new Array()
          });
     }

     const removeStep = (key: string) => {
          let cacheSteps = steps;

          if (cacheSteps[key].length > 0) {
               if (cacheSteps[parseInt(key) - 1]) {
                    cacheSteps[parseInt(key) - 1].push(...cacheSteps[key]);
               } else {
                    cacheSteps[parseInt(key) + 1].push(...cacheSteps[key]);
               }
          }
          
          for (let i = parseInt(key)+1; i < Object.keys(cacheSteps).length; i++) {
               cacheSteps[i-1] = cacheSteps[i];
          }

          delete cacheSteps[Object.keys(cacheSteps).length-1];

          setSteps({
               ...cacheSteps
          });
          changeForm({
               ...cacheSteps
          });
     }

     const alterStepLocation = (oldIndex: number | string, newIndex: number | string) => {
          if (newIndex >= Object.keys(steps).length || oldIndex < 0) return;
          let oldValue = steps[oldIndex];
          let newValue = steps[newIndex];

          setSteps({
               ...steps,
               [oldIndex]: newValue,
               [newIndex]: oldValue
          });
          changeForm({
               ...steps,
               [oldIndex]: newValue,
               [newIndex]: oldValue
          });
     }
     
     const switchModuleList = (sourceID: string, sourceIndex: number, destinationID: string, destinationIndex: number) => {
          let cachedSteps = steps;
          cachedSteps[destinationID].splice(destinationIndex, 0, cachedSteps[sourceID][sourceIndex]);
          cachedSteps[sourceID].splice(sourceIndex, 1);
          setSteps({
               ...cachedSteps
          })
          changeForm({
               ...cachedSteps
          });
     }

     const alterModuleLocation = (sourceID: string, sourceIndex: number, destinationIndex: number) => {
          let cachedSteps = steps;
          let oldValue = cachedSteps[sourceID][sourceIndex];
          let newValue = cachedSteps[sourceID][destinationIndex];

          cachedSteps[sourceID][sourceIndex] = newValue;
          cachedSteps[sourceID][destinationIndex] = oldValue;

          setSteps({
               ...cachedSteps
          });
          changeForm({
               ...cachedSteps
          });
     }

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

          if (destination.droppableId === source.droppableId) {
               alterModuleLocation(source.droppableId, source.index, destination.index);
               return;
          }

          if (destination.droppableId !== source.droppableId) {
               switchModuleList(source.droppableId, source.index, destination.droppableId, destination.index);
               return;
          }
     }

     return (
          <>
               <DragDropContext onDragEnd={onDragEnd} >
                    <Box display="flex" flexDirection="column" className={classes.root}>
                         <div className={classes.subRoot}>
                              <div className={classes.toolbar}>
                                   <Box width="25%">
                                        <Typography variant="h6" className={classes.orderTitle}>
                                             {title}
                                        </Typography>
                                   </Box>
                                        <Typography align="center" variant="subtitle1">
                                             {help}
                                        </Typography>
                                   <Box width="25%" display="flex" justifyContent="flex-end" >
                                        <AddStepButton label="Add Step" onClick={addStep} />
                                   </Box>
                              </div>
                              
                              {Object.keys(steps).sort().map((stepKey, i) => (
                                   <Box display="flex" alignItems="center" className={classes.stepWrapper} key={"stepbox" + stepKey}>
                                        <Box padding={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                             <Typography variant="subtitle1">
                                                  {"Step " + (i + 1)}
                                             </Typography>
                                             <StepMover botEdge={parseInt(stepKey) === (Object.keys(steps).length-1)} topEdge={parseInt(stepKey) === 0} up={() => alterStepLocation(parseInt(stepKey), parseInt(stepKey) - 1)} down={() => alterStepLocation(parseInt(stepKey), parseInt(stepKey) + 1)} />
                                        </Box>
                                        <Droppable droppableId={stepKey}  direction="horizontal">
                                             {(droppableProvided, snapshot) => (
                                                  <div ref={droppableProvided.innerRef}
                                                       {...droppableProvided.droppableProps}
                                                       className={
                                                            classes.droppable + (snapshot.isDraggingOver ? ' isDraggingOver' : '')
                                                       }
                                                  >
                                                       {steps[stepKey].map((module: IModule, index: number) => {
                                                            return React.Children.map(children, (child) => {
                                                                 return React.cloneElement(child, {
                                                                      steps: steps,
                                                                      info: module,
                                                                      index: index,
                                                                      stepKey: stepKey,
                                                                      subSteps: steps[stepKey][index].steps
                                                                 });
                                                            });
                                                       })}
                                                  </div>
                                             )}
                                        </Droppable>
                                        
                                        <Box>
                                             <RemoveStepButton label="" onClick={() => removeStep(stepKey)} disabled={(Object.keys(steps).length > 1) ? false : true} />
                                        </Box>    
                                   </Box>
                              ))}
                         </div>
                    </Box>
               </DragDropContext>
          </>
     )
}

export default Steps;
