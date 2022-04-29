/**
* @file Module card located on the step of the module manager.
* @module ModuleCard
* @category ModuleManager
* @author Braden Cariaga
*/

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

/**
 * Module card located on the step of the module manager.
 * @param {ModuleCardProps} props - ModuleCardProps 
 * @returns 
 */
const ModuleCard = ({ info, index, stepKey, changeStep, changeIndex, fields, updateComponent, calculateTTC }: ModuleCardProps) => {
    const translate = useTranslate();

    const [open, setOpen] = useState(false);
    const source = `modules[${stepKey}][${index}]`;

    const { getValues, setValue } = useFormContext();

    /**
     * When the user clicks on the button, the modal will open.
     */
    const handleClickOpen = () => {
        setOpen(true);
    }

    /**
     * If the user clicks the cancel button, then update the component and return.
     * @returns The function cancelCreator is returning the function updateComponent.
     */
    const cancelCreator = () => {
        updateComponent();
        return;
    }

    /**
     * When the submit button is clicked, the updateComponent function is called, and then the function
     * returns.
     * @returns Nothing.
     */
    const submitCreator = () => {
        updateComponent();
        return;
    }

    /**
     * If the key is defined, return the source concatenated with the key, otherwise return the source.
     * @param {string} [key] - The key of the object you want to get the value of.
     * @returns A function that takes a key and returns a string.
     */
    const getSource = (key?: string) => {
        if (key) return `${source}.${key}`.toString();
        return source.toString();
    }

    /**
     * If the stepKey is the last step, then change the index to the length of the modules array.
     * @returns Nothing.
     */
    const deleteCreator = () => {
        const moduleSteps = getValues('modules');
        const moduleStepCount = Object.keys(moduleSteps).length;

        let modules = getValues(`modules[${stepKey}]`);
        modules.splice(index, 1);
        setValue(`modules[${stepKey}]`, modules);

        if (parseInt(stepKey?.split('-')[1] || "0") === (moduleStepCount - 1)) {
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