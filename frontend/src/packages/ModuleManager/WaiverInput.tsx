import get from "lodash.get";
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

    const createWaiverTasks = (): ITaskStep => {
        const waiveApproval: ITaskWaiverReview = {
            id: "",
            title: "Module Waiver Approval",
            status: "AWAITING",
            type: "MODULE_WAIVER_APPROVAL"
        }

        return {
            ["key-0"]: [
                waiveApproval
            ]
        };
    }

    const addWaiveTasks = () => {
        //Set the waive status to true on the form.
        setValue(props.source + ".waive_module", true);

        //Save steps for caching.
        setCacheTasks(getValues(props.source + ".tasks"));

        //Set the tasks.
        setValue(props.source + ".tasks", createWaiverTasks());

        props.setShowSteps(true);
    }

    const removeWaiveTasks = () => {
        //Set the waive status to true on the form.
        setValue(props.source + ".waive_module", false);

        if (cacheTasks) {
            setValue(props.source + ".tasks", cacheTasks);
        } else {
            setValue(props.source + ".tasks", {
                ["0"]: [{}]
            })
        }

        props.setShowSteps(false);
    }

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
            <BooleanInput label="project.layout.waive_module" source={props.source + ".waive_module"} helperText=" " defaultValue={false} onChange={handleChange} />
        </>
    )
}

export default WaiverInput;