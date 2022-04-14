import { FormGroupContextProvider } from "react-admin";
import { Step } from "src/packages/FormStepper/Step";
import { ModuleTemplateTaskFields } from "src/components/templates";
import TaskManager from "src/packages/TaskManager";

export type ModuleTemplateTasksProps = {
    getSource: Function,
    calculateTTC?: Function,
    validator: string
}

const Tasks = (props: ModuleTemplateTasksProps) => {    
    const { getSource, calculateTTC, validator, ...rest } = props;

    /*const form = useForm();

    const recalculateTTC = (data: any) => {
        const formData = form.getState().values;
        if (!get(formData, getSource?.('tasks') || "")) return;

        let module_ttc = 0;
        for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(get(formData, getSource?.('tasks') || ""))) {
            let stepTTC: number = 0;
            for (let [taskKey, task] of Object.entries<ITaskTemplate>(step)) {
                if (task.ttc < stepTTC) continue;
                stepTTC = task.ttc;
            }
            module_ttc += stepTTC;
        }

        if (module_ttc == get(formData, getSource?.('ttc') || "")) return;

        form.change(getSource?.('ttc'), module_ttc);
    }

    useEffect(() => (props.calculateTTC) ? props.calculateTTC() : null, [get(form.getState().values, getSource?.('ttc'))])*/

    return (
        <>
            <Step validator={props.validator} {...rest}>
                <FormGroupContextProvider name={props.validator}>    
                    <TaskManager source={getSource?.('tasks') || ""} fields={<ModuleTemplateTaskFields calculateTTC={/*recalculateTTC TODO*/ () => true} />}/>
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Tasks;