import { Card, makeStyles, Typography } from "@material-ui/core";
import get from "lodash.get";
import React from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { ITask } from "src/util/types";
import Creator from "./Creator";
import TaskFields from "./TaskFields";

const useStyles = makeStyles(theme => ({
    root: {
        marginBottom: '0',
        height: 'auto'
    },
    cardContent: {
        padding: theme.spacing(1),
        display: 'flex',
        flexDirection: 'column'
    },
    cardText: {
        margin: '0',
    }
}));

type TaskCardProps = {
    info?: ITask,
    index?: number,
    stepKey?: string,
    baseSource?: string,
    fixKey: Function,
    fields?: JSX.Element
}

const TaskCard = ({ info, index, stepKey, baseSource, fixKey, fields }: TaskCardProps) => {
    const translate = useTranslate();
    const classes = useStyles();

    const [open, setOpen] = useState(false);
    const form = useForm();
    const source = `${baseSource}[${stepKey}][${index}]`;

    const handleClickOpen = () => {
        setOpen(true);
    }

    const cancelCreator = () => {
        return;
    }

    const submitCreator = () => {
        return;
    }

    const getSource = (key?: string) => {
        if (key) return `${source}.${key}`.toString();
        return source.toString();
    }

    const deleteCreator = () => {
        let modules = get(form.getState().values, `${baseSource}[${stepKey}]`);
        modules.splice(index, 1);
        form.change(`${baseSource}[${stepKey}]`, modules);

        if (modules.length <= 0) {
            fixKey(stepKey?.split('-')[1]);
        }
    }

    return (
        <>
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
                            {(fields) ? React.cloneElement(fields, { getSource: getSource, initialValues: info }) : <TaskFields getSource={getSource} initialValues={info} />}
                        </Creator>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default TaskCard