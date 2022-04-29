/**
* @file Task card located on the step of the task manager.
* @module TaskCard
* @category TaskManager
* @author Braden Cariaga
*/

import { Card, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import React from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { ITask } from "src/util/types";
import Creator from "src/components/Creator";
import TaskFields from "./TaskFields";
import { useFormContext } from "react-hook-form";

const PREFIX = 'TaskCard';

const classes = {
    root: `${PREFIX}-root`,
    cardContent: `${PREFIX}-cardContent`,
    cardText: `${PREFIX}-cardText`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        marginBottom: '0',
        height: 'auto'
    },

    [`& .${classes.cardContent}`]: {
        padding: theme.spacing(1),
        display: 'flex',
        flexDirection: 'column'
    },

    [`& .${classes.cardText}`]: {
        margin: '0',
    }
}));

export type TaskCardProps = {
    info?: ITask,
    index?: number,
    stepKey?: string,
    baseSource?: string,
    changeStep: Function,
    changeIndex: Function,
    fields?: JSX.Element,
    calculateTTC?: Function,
    updateComponent: Function
}

const TaskCard = ({ info, index, stepKey, baseSource, changeStep, changeIndex, updateComponent, fields, calculateTTC }: TaskCardProps) => {
    const translate = useTranslate();


    const [open, setOpen] = useState(false);
    const source = `${baseSource}[${stepKey}][${index}]`;

    const { getValues, setValue } = useFormContext();

    const handleClickOpen = () => {
        setOpen(true);
    }

    const cancelCreator = () => {
        updateComponent();
        return;
    }

    const submitCreator = () => {
        updateComponent();
        return;
    }

    const getSource = (key?: string) => {
        if (key) return `${source}.${key}`.toString();
        return source.toString();
    }

    const deleteCreator = () => {
        const taskSteps = getValues(`${baseSource}`);
        const taskStepCount = Object.keys(taskSteps).length;
        
        let tasks = getValues(`${baseSource}[${stepKey}]`);
        tasks.splice(index, 1);
        setValue(`${baseSource}[${stepKey}]`, tasks);

        if (parseInt(stepKey?.split('-')[1] || "0") === (taskStepCount - 1)) {
            changeIndex(tasks.length);
        }

        updateComponent();
    }

    return (
        <Root>
            <Draggable draggableId={"task-" + stepKey + "-" + index || ""} index={index || 0} key={info?.id || ""}>
                {(provided, snapshot) => (
                    <div
                        className={classes.root}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        ref={provided.innerRef}
                    >
                        <Card
                            style={{
                                opacity: snapshot.isDragging ? 0.9 : 1,
                                transform: snapshot.isDragging
                                    ? 'rotate(-2deg)'
                                    : '',
                            }}
                            elevation={snapshot.isDragging ? 3 : 1}
                            onClick={handleClickOpen}
                        >
                            <div className={classes.cardContent}>
                                <div className={classes.cardText}>
                                    <Typography variant="body2">
                                        {info?.title}
                                    </Typography>
                                </div>
                            </div>
                        </Card>
                        <Creator
                            label={translate('project.layout.edit_task', { title: info?.title || "cannot find task" })}
                            open={open}
                            setOpen={setOpen}
                            ariaLabel={"task-update-" + stepKey + "-" + index}
                            cancelAction={cancelCreator}
                            submitAction={submitCreator}
                            deleteAction={deleteCreator}
                            maxWidth="md"
                        >
                            {(fields) ? React.cloneElement(fields, { getSource: getSource, defaultValues: info }) : <TaskFields getSource={getSource} defaultValues={info} calculateTTC={calculateTTC} />}
                        </Creator>
                    </div>
                )}
            </Draggable>
        </Root>
    );
}

export default TaskCard