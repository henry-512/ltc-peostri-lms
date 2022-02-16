import { useTranslate } from 'react-admin';
import { ModuleCard } from '.';
import { IModule, IModuleStep, ITask, ITaskStep } from 'src/util/types';
import Steps from '../steps';
import { useForm } from 'react-final-form';

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

// TODO: Enable Reverting on Steps

/*
const findModule = (formModules: IModule[], id: string | undefined): [IModule, number] | [undefined, undefined] => {
     for (let i = 0; i < formModules.length; i++) {
          if (formModules[i].id == id) {
               return [formModules[i], i];
               break;
          }
     }
     return [undefined, undefined]
}

const findTask = (formTasks: ITask[], id: string | undefined): [ITask, number] | [undefined, undefined] => {
     for (let i = 0; i < formTasks.length; i++) {
          if (formTasks[i].id == id) {
               return [formTasks[i], i];
               break;
          }
     }
     return [undefined, undefined]
}

const getCurrentSteps = (formModules: IModule[], formSteps?: IModuleStep) => {
     if (!formModules) return {};
     if (!formSteps) return setUpSteps(formModules);

     let moduleCache = formModules;
     
     const moduleStepKeys = Object.keys(formSteps);
     for (let i = 0; i < Object.keys(formSteps).length; i++) {
          let moduleStep = formSteps[moduleStepKeys[i]]
          for (let j = 0; j < moduleStep.length; j++) {
               let [foundModule, id] = findModule(moduleCache, formSteps[moduleStepKeys[i]][j]?.id);
               
               if (!foundModule) {
                    formSteps[moduleStepKeys[i]].splice(j, 1);
                    continue;
               }

               if (id) moduleCache.splice(id, 1);

               let taskCache = foundModule.tasks;
               
               const taskSteps = formSteps[moduleStepKeys[i]][j].steps
               formSteps[moduleStepKeys[i]][j] = foundModule;
               
               let taskStepKeys = Object.keys(taskSteps)
               for (let k = 0; k < taskStepKeys.length; k++) {
                    for (let l = 0; l < taskSteps[taskStepKeys[k]].length; l++) {
                         let [foundTask, id] = findTask(taskCache, taskSteps[taskStepKeys[k]][l].id);

                         if (!foundTask) {
                              formSteps[moduleStepKeys[i]][j].steps[taskStepKeys[k]].splice(l, 1);
                              continue;
                         }

                         if (id) taskCache.splice(id, 1);
                         
                         formSteps[moduleStepKeys[i]][j].steps[taskStepKeys[k]][l] = foundTask;
                    }
               }

               /*for (let g = 0; g < taskCache.length; g++) {
                    formSteps[moduleStepKeys[i]][j].steps[taskStepKeys.length] = new Array<ITask>();
                    formSteps[moduleStepKeys[i]][j].steps[taskStepKeys.length].push(taskCache[g]);
               }
               console.log(taskCache);
          }
     }

     /*for (let g = 0; g < moduleCache.length; g++) {
          formSteps[moduleStepKeys.length] = new Array<IModule>();
          formSteps[moduleStepKeys.length].push(moduleCache[g]);
     }
     console.log(moduleCache);

     return formSteps;
}
*/
const OrderContent = (props: any) => {
     const translate = useTranslate();
     const form = useForm();
     const formData = form.getState().values;
     
     return (
          <>
               <Steps title={translate('project.create.layout.order_modules')} help={translate('project.create.layout.order_modules_help')} ogSteps={setUpSteps(formData.modules)} save="steps" changeOnAction={true}>
                    <ModuleCard />
               </Steps>
          </>
     )
}

export default OrderContent;