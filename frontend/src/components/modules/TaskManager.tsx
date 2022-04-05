import { useTranslate } from 'react-admin';
import { ITask, ITaskStep } from 'src/util/types';
import Steps from '../StepBuilder';
import { useForm, useFormState } from 'react-final-form';
import TaskFields from './TaskFields';
import Creator from './Creator';
import { useEffect, useMemo, useState } from 'react';
import get from 'lodash.get';
import TaskCard from './TaskCard';
import React from 'react';

type TaskManagerProps = {
    source: string,
    fields?: JSX.Element,
    calculateTTC?: Function
}

const TaskManager = (props: TaskManagerProps) => {
    const translate = useTranslate();
    const form = useForm();

    //Dialogs open
    const [creatorOpen, setCreatorOpen] = useState(false);

    //Main Tasks Data
    const [tasks, setTasks] = useState(get(form.getState().values, props.source) || {
        "key-0": []
    } as ITaskStep);

    /**
     * @name calculateStep
     * @description Helper function to quickly calculate the current step based on tasks data.
     * @returns Current Step Key
     */
    const calculateStep = () => {
        return (tasks) ? (Object.keys(tasks).length - 1) : 0
    }

    const updateComponent = () => {
        let ftasks = get(form.getState().values, props.source);
        setTasks(ftasks);
    }

    /**
     * @name calculateIndex
     * @description Helper function to quickly calculate the next Index based on tasks data.
     * @returns Next Index
     */
     const calculateIndex = () => {
        return (tasks[`key-${step}`] && tasks[`key-${step}`].length > 0) ? tasks[`key-${step}`].length : 0
    }

    //Current Step Key
    const [step, setStep] = useState(() => calculateStep());
    //Current Index on Step
    const [index, setIndex] = useState(() => calculateIndex());

    const newSource = useMemo(() => `${props.source}[key-${step}][${index}]`, [step, index]);

    /**
     * @name openCreator
     * @description Opens the creator window to add a new task.
     */
    const openCreator = () => {        
        if (!tasks[`key-${step}`]) return;
        setIndex(calculateIndex());

        // Create empty module structure on this step.
        let stepArray = tasks[`key-${step}`];
        stepArray.push({} as ITask);

        // Update form with blank step added.
        form.change(props.source, {
            ...tasks,
            [`key-${step}`]: stepArray
        });

        // Open the creator window.
        setCreatorOpen(true);
    }

    /**
     * @name cancelCreator
     * @description Cancel the creator by removing the empty task structure created.
     */
     const cancelCreator = () => {
        let cacheModules = tasks;

        if (!cacheModules[`key-${step}`]) return;

        cacheModules[`key-${step}`].pop();

        form.change(props.source, cacheModules);
        updateComponent();
    }

    /**
     * @name submitCreator
     * @description Submit method for the creator. Increments the index.
     */
     const submitCreator = () => {
        updateComponent();
    }

    const getNewSource = (key: string) => {
        if (key) return `${newSource}.${key}`.toString();
        return newSource.toString();
    }

    const updateStep = (newSteps: any) => {
        form.change(props.source, newSteps)
        updateComponent();
    }
    
    //console.log(step, index, newSource, get(form.getState().values, props.source));

    return (
        <>
            <Steps
                title={translate('project.layout.task_title')}
                help={translate('project.layout.order_tasks_help')}
                save={props.source}
                createLabel="project.layout.create_task"
                createAction={openCreator}
                changeStep={setStep}
                changeIndex={setIndex}
                renderData={tasks}
                updateForm={updateStep}
                changeOnAction={false}
                emptyText={translate('project.layout.no_tasks')}
            >
                <TaskCard baseSource={props.source} changeStep={setStep} changeIndex={setIndex} updateComponent={updateComponent} fields={props.fields} calculateTTC={props.calculateTTC} />
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
                {(props.fields) ? React.cloneElement(props.fields, { getSource: getNewSource }) : <TaskFields getSource={getNewSource} calculateTTC={props.calculateTTC} />}
            </Creator>
        </>
    )
}

export default TaskManager;