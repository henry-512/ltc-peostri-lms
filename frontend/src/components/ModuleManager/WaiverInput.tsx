/**
* @file Waiver input used by the module fields for toggling the waivers.
* @module WaiverInput
* @category ModuleManager
* @author Braden Cariaga
*/

import { useCallback, useState } from "react";
import { BooleanInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { ITaskStep, ITaskWaiverReview } from "src/util/types";

export type WaiverInputProps = {
    source: string,
    setShowSteps: Function
}

const WaiverInput = (props: WaiverInputProps): JSX.Element => {
    const { getValues, setValue } = useFormContext();
    const [cacheTasks, setCacheTasks] = useState(undefined);

    /**
     * This function returns an object with a single key, whose value is an array of objects.
     * @returns An object with a single key, "key-0", which has a value of an array with a single
     * element, an object with the following properties:
     */
    const createWaiverTasks = (): ITaskStep => {
        const waiveApproval: ITaskWaiverReview = {
            id: "",
            title: "Module Waiver Approval",
            status: "AWAITING",
            type: "WAIVER_APPROVE",
            ttc: 10
        }

        return {
            "key-0": [
                waiveApproval
            ]
        };
    }

    /**
     * Set the waive status to true on the form. Save steps for caching. Set the tasks.
     * props.setShowSteps(true);
     */
    const addWaiveTasks = () => {
        //Set the waive status to true on the form.
        setValue(props.source + ".waive_module", true);

        //Save steps for caching.
        setCacheTasks(getValues(props.source + ".tasks"));

        //Set the tasks.
        setValue(props.source + ".tasks", createWaiverTasks());

        props.setShowSteps(true);
    }

    /**
     * If the cacheTasks variable is true, then set the value of the tasks field to the cacheTasks
     * variable, otherwise set the value of the tasks field to an empty array.
     */
    const removeWaiveTasks = () => {
        //Set the waive status to true on the form.
        setValue(props.source + ".waive_module", false);

        if (cacheTasks) {
            setValue(props.source + ".tasks", cacheTasks);
        } else {
            setValue(props.source + ".tasks", {
                "0": []
            })
        }

        props.setShowSteps(false);
    }

    /**
     * If the value is not null, then add waive tasks, otherwise remove waive tasks.
     * @param {any} value - any - the value of the form field
     */
    const formChange = (value: any) => {
        if (!value) {
            removeWaiveTasks();
        } else {
            addWaiveTasks();
        }
    }

    const handleChange = useCallback(
        (value: any) => {
            formChange(value);
        },
        [formChange]
    );

    return (
        <>
            <BooleanInput label="project.layout.waive_module" source={props.source + ".waive_module"} helperText=" " defaultValue={false} onChange={(e) => handleChange(e.target.checked)} />
        </>
    )
}

export default WaiverInput;