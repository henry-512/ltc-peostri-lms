import { Card, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import React from "react";
import { useState } from "react";
import { useTranslate } from "react-admin";
import { Draggable } from "react-beautiful-dnd";
import { IModule, ITaskStep } from "src/util/types";
import ModuleFields from "./ModuleFields";
import { useFormContext } from "react-hook-form";
import Creator from "../Creator";

const PREFIX = 'ModuleCard';

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

export type ModuleCardProps = {
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

    const [open, setOpen] = useState(false);
    const source = `modules[${stepKey}][${index}]`;

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
        const moduleSteps = getValues('modules');
        const moduleStepCount = Object.keys(moduleSteps).length;

        let modules = getValues(`modules[${stepKey}]`);
        modules.splice(index, 1);
        setValue(`modules[${stepKey}]`, modules);

        if (parseInt(stepKey?.split('-')[1] || "0") == (moduleStepCount - 1)) {
            changeIndex(modules.length);
        }
        
        return;
    }

    return (
        <Root>
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
                            {(fields) ? React.cloneElement(fields, { getSource: getSource, defaultValues: info }) : <ModuleFields getSource={getSource} defaultValues={info} calculateTTC={calculateTTC} />}
                        </Creator>
                    </div>
                )}
            </Draggable>
        </Root>
    );
}

export default ModuleCard