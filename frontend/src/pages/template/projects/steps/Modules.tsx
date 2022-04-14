import { FormGroupContextProvider } from "react-admin";
import ModuleManager from "src/packages/ModuleManager";
import { Step } from "src/packages/FormStepper/Step";
import { ModuleTemplateFields } from "src/components/templates";

export type ModulesManagerStep = {
    getSource: Function,
    calculateTTC?: Function,
    validator: string
}

const Modules = (props: ModulesManagerStep) => {    
    const { getSource, validator, calculateTTC, ...rest } = props;
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
                    <ModuleManager fields={<ModuleTemplateFields calculateTTC={/*recalculateTTC TODO*/ () => true} />} isTemplate={true} />
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Modules;