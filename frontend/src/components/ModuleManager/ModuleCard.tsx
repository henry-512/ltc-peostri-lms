import { Card, makeStyles, Typography } from "@material-ui/core";
import get from "lodash.get";
import React from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { useForm } from "react-final-form";
import { IModule, ITaskStep } from "src/util/types";
import Creator from "../Creator";
import ModuleFields from "./ModuleFields";

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
export interface ModuleCardProps {
    steps?: any,
    info?: IModule,
    index?: number,
    stepKey?: string,
    subSteps?: ITaskStep,
    getSource?: string,
    changeStep: Function,
    changeIndex: Function,
    fields?: JSX.Element,
    calculateTTC?: Function,
    updateComponent: Function
}

const ModuleCard = ({ info, index, stepKey, changeStep, changeIndex, fields, updateComponent, calculateTTC }: ModuleCardProps) => {
    const translate = useTranslate();
    const classes = useStyles();

    const [open, setOpen] = useState(false);
    const form = useForm();
    const source = `modules[${stepKey}][${index}]`;

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
        const formData = form.getState().values;
        const moduleStepCount = Object.keys(formData.modules).length;

        let modules = get(formData, `modules[${stepKey}]`);
        modules.splice(index, 1);
        form.change(`modules[${stepKey}]`, modules);

        if (parseInt(stepKey?.split('-')[1] || "0") == (moduleStepCount - 1)) {
            changeIndex(modules.length);
        }

        updateComponent();
    }

    return (
        <>
            <Draggable draggableId={"module-" + stepKey + "-" + index || ""} index={index || 0} key={info?.id || ""}>
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
                            label={translate('project.layout.edit_module', { title: info?.title || "cannot find module" })}
                            open={open}
                            setOpen={setOpen}
                            ariaLabel={"module-update-" + stepKey + "-" + index}
                            cancelAction={cancelCreator}
                            submitAction={submitCreator}
                            deleteAction={deleteCreator}
                        >
                            {(fields) ? React.cloneElement(fields, { getSource: getSource, initialValues: info }) : <ModuleFields getSource={getSource} initialValues={info} calculateTTC={calculateTTC} />}
                        </Creator>
                    </div>
                )}
            </Draggable>
        </>
    )
}

export default ModuleCard