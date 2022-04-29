/**
* @file Main step builder component used by the Task Manger and Module Manager.
* @module StepBuilder
* @category StepBuilder
* @author Braden Cariaga
*/

import { Box, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { MouseEventHandler, useEffect } from "react";
import { useState } from "react";
import { DragDropContext, Droppable, OnDragEndResponder } from "react-beautiful-dnd";
import { useFormContext } from "react-hook-form";
import AddNewButton from "./AddNewButton";
import AddStepButton from "./AddStepButton";
import RemoveStepButton from "./RemoveStepButton";
import StepMover from "./StepMover";

const PREFIX = 'StepBuilder';

const classes = {
    root: `${PREFIX}-root`,
    subRoot: `${PREFIX}-subRoot`,
    droppable: `${PREFIX}-droppable`,
    toolbar: `${PREFIX}-toolbar`,
    orderTitle: `${PREFIX}-orderTitle`,
    sideToolbar: `${PREFIX}-sideToolbar`,
    stepWrapper: `${PREFIX}-stepWrapper`,
    moduleDropper: `${PREFIX}-moduleDropper`
};

const Root = styled('div')(({ theme }) => ({
    width: '100%',

    [`& .${classes.root}`]: {
        marginTop: '1rem'
    },

    [`& .${classes.subRoot}`]: {
        flex: 1,
        '&:first-of-type': {
            borderTopLeftRadius: 5,
        },
        '&:last-child': {
            borderTopRightRadius: 5,
        },
        border: '1px solid ' + theme.palette.borderColor?.main,
        overflow: 'hidden'
    },

    [`& .${classes.droppable}`]: {
        flex: 1,
        display: 'flex',
        borderRadius: 5,
        padding: 5,
        height: '100%',
        minHeight: '50px',
        width: '100%',
        background: '#f5f5f5',
        transition: 'all .2s ease',
        alignItems: 'center',
        gap: '.25rem',
        flexWrap: 'wrap',
        '&.isDraggingOver': {
            backgroundColor: '#e0e0e3',
            transition: 'all .2s ease',
        },
    },

    [`& .${classes.toolbar}`]: {
        width: '100%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        boxSizing: 'border-box',
        backgroundColor: '#f5f5f5'
    },

    [`& .${classes.orderTitle}`]: {
        lineHeight: '1',
        color: theme.palette.text.primary,
        width: 'fit-content'
    },

    [`& .${classes.sideToolbar}`]: {
        width: '25%'
    },

    [`& .${classes.stepWrapper}`]: {
        '&:not(:last-child)': {
            borderBottom: '1px solid ' + theme.palette.borderColor?.main
        }
    },

    [`& .${classes.moduleDropper}`]: {

    }
}));

export type StepBuilderProps = {
    title: string,
    help: string,
    children: JSX.Element | JSX.Element[],
    save?: string,
    changeOnAction?: boolean,
    updateForm?: Function,
    createLabel?: string,
    createAction?: MouseEventHandler<Element>,
    defaultValue?: any,
    renderData?: any,
    changeStep: Function,
    changeIndex: Function,
    updateComponent?: Function,
    emptyText: string,
    actions?: JSX.Element[]
}

const StepBuilder = (props: StepBuilderProps) => {
    const { title, help, save, children, changeOnAction, updateForm, createLabel, createAction, renderData = {
        "key-0": []
    }, changeStep, updateComponent, emptyText, actions } = props;

    const { setValue } = useFormContext();

    const [canAddSteps, setCanAddSteps] = useState(false);

    /* Checking if the renderData object has a length greater than or equal to 1. If it does, it sets
    the canAddSteps state to true. If it doesn't, it sets the canAddSteps state to false. */
    useEffect(() => {
        if (Object.keys(renderData).length >= 1) {
            if (!canAddSteps) setCanAddSteps(true);
        } else {
            if (canAddSteps) setCanAddSteps(false);
        }
    });

    /**
     * If the changeOnAction variable is false, then update the form with the newValue, otherwise set
     * the value to the save variable or the renderData variable.
     * @param {any} [newValue] - The new value to be set.
     */
    const changeForm = (newValue?: any) => {
        if (!changeOnAction) {
            if (!updateForm) return;
            updateForm(newValue);
            updateComponent?.();
            return;
        }

        setValue(save || "", newValue || renderData);
        updateComponent?.();
    }

    /**
     * When the addStep function is called, the renderData object is updated with a new key and an
     * empty array as the value, and the step variable is updated with the length of the renderData
     * object.
     */
    const addStep = () => {
        changeForm({
            ...renderData,
            ["key-" + Object.keys(renderData).length]: []
        });
        changeStep(Object.keys(renderData).length);
    }

    /**
     * "If the key is greater than 0, then push the key's value into the previous key's value,
     * otherwise push the key's value into the next key's value."
     * 
     * @param {string} key - string - the key of the step to be removed
     */
    const removeStep = (key: string) => {
        let cacheSteps = renderData;

        if (cacheSteps[key].length > 0) {
            if (cacheSteps["key-" + (parseInt((key.split('-')[1])) - 1)]) {
                cacheSteps["key-" + (parseInt((key.split('-')[1])) - 1)].push(...cacheSteps[key]);
            } else {
                cacheSteps["key-" + (parseInt((key.split('-')[1])) + 1)].push(...cacheSteps[key]);
            }
        }

        for (let i = parseInt(key.split('-')[1]) + 1; i < Object.keys(renderData).length; i++) {
            cacheSteps["key-" + (i - 1)] = cacheSteps["key-" + i];
        }

        delete cacheSteps["key-" + (Object.keys(cacheSteps).length - 1).toString()];

        changeStep(Object.keys(cacheSteps).length - 1);

        changeForm({
            ...cacheSteps
        });
    }

    /**
     * If the new index is greater than the length of the object, or the old index is less than 0,
     * return. Otherwise, set the old value to the old index, and the new value to the new index, and
     * change the form.
     * @param {number | string} oldIndex - The index of the step that is being moved.
     * @param {number | string} newIndex - The new index of the step
     */
    const alterStepLocation = (oldIndex: number | string, newIndex: number | string) => {
        if (newIndex >= Object.keys(renderData).length || oldIndex < 0) return;
        let oldValue = renderData["key-" + oldIndex];
        let newValue = renderData["key-" + newIndex];

        changeForm({
            ...renderData,
            ["key-" + oldIndex]: newValue,
            ["key-" + newIndex]: oldValue
        });
    }

    /**
     * "switchCardList" is a function that takes in 4 arguments, and then it does some stuff with those
     * arguments.
     * @param {string} sourceID - The ID of the source list.
     * @param {number} sourceIndex - The index of the card in the source list.
     * @param {string} destinationID - the ID of the column you're dropping the card into
     * @param {number} destinationIndex - number - The index of the card in the destination list.
     */
    const switchCardList = (sourceID: string, sourceIndex: number, destinationID: string, destinationIndex: number) => {
        let cachedSteps = renderData;
        cachedSteps[destinationID].splice(destinationIndex, 0, cachedSteps[sourceID][sourceIndex]);
        cachedSteps[sourceID].splice(sourceIndex, 1);

        changeForm({
            ...cachedSteps
        });
    }

    /**
     * "I'm trying to swap the values of two objects in an array, but I'm getting an error that says I
     * can't assign to the index of an array."
     * 
     * Here's the error:
     * TypeError: Cannot assign to read only property '0' of object '[object Object]'
     * 
     * Here's the code that calls the function:
     * @param {string} sourceID - The ID of the column that the card is being dragged from.
     * @param {number} sourceIndex - The index of the card that is being moved.
     * @param {number} destinationIndex - The index of the card that was dragged to.
     */
    const alterCardLocation = (sourceID: string, sourceIndex: number, destinationIndex: number) => {
        let cachedSteps = renderData;
        let oldValue = cachedSteps[sourceID][sourceIndex];
        let newValue = cachedSteps[sourceID][destinationIndex];

        cachedSteps[sourceID][sourceIndex] = newValue;
        cachedSteps[sourceID][destinationIndex] = oldValue;

        changeForm({
            ...cachedSteps
        });
    }

    /**
     * If the destination is the same as the source, alter the card location, if not, switch the card
     * list.
     * @returns the result of the drag and drop.
     */
    const onDragEnd: OnDragEndResponder = async result => {
        const { destination, source } = result;

        if (!destination) {
            return;
        }

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (destination.droppableId === source.droppableId) {
            alterCardLocation(source.droppableId, source.index, destination.index);
            return;
        }

        if (destination.droppableId !== source.droppableId) {
            switchCardList(source.droppableId, source.index, destination.droppableId, destination.index);
            return;
        }
    }

    return (
        <Root>
            <DragDropContext onDragEnd={onDragEnd}>
                <Box display="flex" flexDirection="column" className={classes.root}>
                    <div className={classes.subRoot}>
                        <div className={classes.toolbar}>
                            <Box width="35%">
                                <Typography variant="h6" className={classes.orderTitle}>
                                    {title}
                                </Typography>
                            </Box>
                            <Typography align="center" variant="subtitle1">
                                {help}
                            </Typography>
                            <Box width="35%" display="flex" justifyContent="flex-end" gap={1}>
                                {
                                    actions?.map((element, i) => {
                                        return React.cloneElement(element, {
                                            key: i
                                        });
                                    })
                                }
                                <AddNewButton label={createLabel} onClick={createAction} />
                                <AddStepButton label="project.layout.add_step" onClick={addStep} disabled={!canAddSteps} />
                            </Box>
                        </div>

                        {(Object.keys(renderData).length >= 1) ?
                            Object.keys(renderData).sort((first, second) => {
                                return parseInt(first.split('-')[1]) - parseInt(second.split('-')[1])
                            }).map((stepKey, i) => (
                                <Box display="flex" alignItems="center" className={classes.stepWrapper} key={"stepbox" + stepKey}>
                                    <Box padding={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                                        <Typography variant="subtitle1">
                                            {"Step " + (i + 1)}
                                        </Typography>
                                        <StepMover botEdge={parseInt(stepKey.split('-')[1]) === (Object.keys(renderData).length - 1)} topEdge={parseInt(stepKey.split('-')[1]) === 0} up={() => alterStepLocation(parseInt(stepKey.split('-')[1]), parseInt(stepKey.split('-')[1]) - 1)} down={() => alterStepLocation(parseInt(stepKey.split('-')[1]), parseInt(stepKey.split('-')[1]) + 1)} />
                                    </Box>
                                    <Droppable droppableId={stepKey} direction="horizontal">
                                        {(droppableProvided, snapshot) => (
                                            <div ref={droppableProvided.innerRef}
                                                {...droppableProvided.droppableProps}
                                                className={
                                                    classes.droppable + (snapshot.isDraggingOver ? ' isDraggingOver' : '')
                                                }
                                            >
                                                {(renderData[stepKey]) ? renderData[stepKey].map((module: any, index: number) => {
                                                    return React.Children.map(children, (child) => {
                                                        return React.cloneElement(child, {
                                                            steps: renderData,
                                                            info: module,
                                                            index: index,
                                                            stepKey: stepKey,
                                                            subSteps: renderData[stepKey][index].tasks
                                                        });
                                                    });
                                                }) : <></>}
                                            </div>
                                        )}
                                    </Droppable>

                                    <Box>
                                        <RemoveStepButton label="" onClick={() => removeStep(stepKey)} disabled={(Object.keys(renderData).length > 1) ? false : true} />
                                    </Box>
                                </Box>
                            )
                            ) : (
                                <>
                                    <Typography variant="subtitle1" align="center" style={{ margin: '1rem 0' }}>
                                        {emptyText}
                                    </Typography>
                                </>
                            )}
                    </div>
                </Box>
            </DragDropContext>
        </Root>
    );
}

export default StepBuilder;
