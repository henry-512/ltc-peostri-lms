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

const ModuleCreator = (props: any) => {
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

export default ModuleCreator;