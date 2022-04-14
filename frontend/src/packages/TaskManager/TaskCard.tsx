import { Card, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import get from "lodash.get";
import React from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { ITask } from "src/util/types";
import { Creator } from "src/components/misc";
import TaskFields from "./TaskFields";

const PREFIX = 'TaskCard';

const classes = {
    root: `${PREFIX}-root`,
    cardContent: `${PREFIX}-cardContent`,
    cardText: `${PREFIX}-cardText`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
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
    const form = useForm();
    const source = `${baseSource}[${stepKey}][${index}]`;

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
        const taskStepCount = Object.keys(get(form.getState().values, `${baseSource}`)).length;
        
        let tasks = get(form.getState().values, `${baseSource}[${stepKey}]`);
        tasks.splice(index, 1);
        form.change(`${baseSource}[${stepKey}]`, tasks);

        if (parseInt(stepKey?.split('-')[1] || "0") == (taskStepCount - 1)) {
            changeIndex(tasks.length);
        }

        updateComponent();
    }

    return (
        (<Root>
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
        </Root>)
    );
}

export default TaskCard