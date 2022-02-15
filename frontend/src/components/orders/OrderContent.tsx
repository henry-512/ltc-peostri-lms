import { Box, makeStyles, Typography } from '@material-ui/core';
import { useState } from 'react';
import { useTranslate } from 'react-admin';
import { DragDropContext, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import { ModuleCard } from '.';
import { IModule, IModuleStep, ITask, ITaskStep } from 'src/util/types';
import Steps from '../steps';
import { useForm } from 'react-final-form';
import { FormatShapesSharp } from '@material-ui/icons';

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

const findModule = (formModules: IModule[], id: string | undefined): IModule | void => {
     for (let i = 0; i < formModules.length; i++) {
          if (formModules[i].id == id) {
               return formModules[i];
               break;
          }
     }
}

const findTask = (formTasks: ITask[], id: string | undefined): ITask | void => {
     for (let i = 0; i < formTasks.length; i++) {
          if (formTasks[i].id == id) {
               return formTasks[i];
               break;
          }
     }
}

const getCurrentSteps = (formModules: IModule[], formSteps?: IModuleStep) => {
     
     if (!formSteps) return setUpSteps(formModules);
     
     const moduleStepKeys = Object.keys(formSteps);
     for (let i = 0; i < Object.keys(formSteps).length; i++) {
          let moduleStep = formSteps[moduleStepKeys[i]]
          for (let j = 0; j < moduleStep.length; j++) {
               let foundModule = findModule(formModules, formSteps[moduleStepKeys[i]][j]?.id);
               
               if (!foundModule) {
                    continue;
               }
               
               const taskSteps = formSteps[moduleStepKeys[i]][j].steps
               formSteps[moduleStepKeys[i]][j] = foundModule;
               
               let taskStepKeys = Object.keys(taskSteps)
               for (let k = 0; k < taskStepKeys.length; k++) {
                    for (let l = 0; l < taskSteps[taskStepKeys[k]].length; l++) {
                         let foundTask = findTask(foundModule.tasks, taskSteps[taskStepKeys[k]][l].id);
                         if (!foundTask) {
                              continue;
                         }
                         
                         formSteps[moduleStepKeys[i]][j].steps[taskStepKeys[k]][l] = foundTask;
                    }
               }
          }
     }
     return formSteps;
}

const OrderContent = (props: any) => {
     const {formData, getSource} = props;
     const translate = useTranslate();
     
     return (
          <>
               <Steps title={translate('project.create.layout.order_modules')} help={translate('project.create.layout.order_modules_help')} ogSteps={getCurrentSteps(formData.modules, formData.steps)} save="steps" changeOnAction={true}>
                    <ModuleCard />
               </Steps>
          </>
     )
}

export default OrderContent;