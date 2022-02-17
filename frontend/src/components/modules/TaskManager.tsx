import { useTranslate } from 'react-admin';
import { IModule, IModuleStep, ITask, ITaskStep } from 'src/util/types';
import Steps from '../steps';
import { useForm, useFormState } from 'react-final-form';
import TaskFields from './TaskFields';
import Creator from './Creator';
import { useEffect, useState } from 'react';
import get from 'lodash.get';
import TaskCard from './TaskCard';

type TaskManagerProps = {
     source: string
}

const TaskManager = (props: TaskManagerProps) => {
     const translate = useTranslate();
     const form = useForm();
     const formData = form.getState().values;
     const [creatorOpen, setCreatorOpen] = useState(false);
     const [tasks, setTasks] = useState(get(formData, props.source) || {} as ITaskStep);
     const [curKey, setCurKey] = useState(Object.keys(tasks).length);
     const [newSource, setNewSource] = useState(`${props.source}[key-${curKey}][0]`);

     useFormState({
          subscription: {
               values: true
          },
          onChange: ({values}) => {
               setTasks(get(values, props.source) || {});
          }
     })

     //Initialize Modules on Form.
     useEffect(() => {
          form.change(props.source, tasks);
     }, []);

     useEffect(() => {}, [tasks])

     const openCreator = () => {
          form.change(props.source, {
               ...tasks,
               [`key-${curKey}`]: [{} as ITask]
          });
          setCreatorOpen(true);

          setNewSource(`${props.source}[key-${curKey}][0]`);
     }

     const cancelCreator = () => {
          let cacheTasks = tasks;
          delete cacheTasks[`key-${curKey}`];
          form.change(props.source, cacheTasks);
     }

     const submitCreator = () => {
          setCurKey(Object.keys(tasks).length);
     }

     const getNewSource = (key: string) => {
          if (key) return `${newSource}.${key}`.toString();
          return newSource.toString();
     }

     const updateStep = (newSteps: any) => {
          console.log(props.source);
          form.change(props.source, newSteps)
     }

     return (
          <>
               <Steps 
                    title={translate('project.layout.task_title')} 
                    help={translate('project.layout.order_tasks_help')} 
                    save="modules" 
                    createLabel="project.layout.create_task" 
                    createAction={openCreator}
                    fixKey={setCurKey}
                    renderData={tasks}
                    emptyText={translate('project.layout.no_tasks')}
                    changeOnAction={false} 
                    updateForm={updateStep}
               >
                    <TaskCard baseSource={props.source} />
               </Steps> 
               <Creator 
                    label={translate('project.layout.create_task')} 
                    open={creatorOpen} 
                    setOpen={setCreatorOpen} 
                    ariaLabel="task-creator" 
                    cancelAction={cancelCreator}
                    submitAction={submitCreator} 
                    create
                    maxWidth="md"
               >
                    <TaskFields getSource={getNewSource} />
               </Creator>
          </>
     )
}

export default TaskManager;