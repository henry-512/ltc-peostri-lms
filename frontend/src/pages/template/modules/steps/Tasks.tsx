import { FormGroupContextProvider } from "react-admin";
import { Step } from "src/packages/FormStepper/Step";
import { ModuleTemplateTaskFields } from "src/components/templates";
import TaskManager from "src/packages/TaskManager";
import { useFormContext } from "react-hook-form";
import { ITaskTemplate } from "src/util/types";

export type ModuleTemplateTasksProps = {
    getSource: Function,
    calculateTTC?: Function,
    validator: string
}

const Tasks = (props: ModuleTemplateTasksProps) => {    
    const { getSource, calculateTTC, validator, ...rest } = props;

    const { setValue, getValues } = useFormContext();

    const recalculateTTC = () => {
        const tasks = getValues(getSource?.('tasks'));
        if (!tasks) return;

        let module_ttc = 0;
        for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(tasks)) {
            let stepTTC: number = 0;
            for (let [taskKey, task] of Object.entries<ITaskTemplate>(step)) {
                if (task.ttc < stepTTC) continue;
                stepTTC = task.ttc;
            }
            module_ttc += stepTTC;
        }

        if (module_ttc == getValues(getSource?.('ttc'))) return;

        setValue(getSource?.('ttc'), module_ttc);

        if (props.calculateTTC) props.calculateTTC()
    }

    return (
        <>
            <Step validator={props.validator} {...rest}>
                <FormGroupContextProvider name={props.validator}>    
                    <TaskManager source={getSource?.('tasks') || ""} fields={<ModuleTemplateTaskFields calculateTTC={recalculateTTC} />}/>
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Tasks;