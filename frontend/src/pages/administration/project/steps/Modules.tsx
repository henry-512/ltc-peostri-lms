import { Step } from "src/packages/FormStepper/Step";
import { FormGroupContextProvider } from "react-admin";
import ModuleManager from "src/packages/ModuleManager";

const Modules = (props: any) => {
    /*const form = useForm();

    const recalculateTTC = () => {
        const formData = form.getState().values;
        if (!formData.modules) return;

        let project_ttc = 0;
        for (let [stepKey, step] of Object.entries<IModuleTemplate[]>(formData.modules)) {
            let stepTTC: number = 0;
            for (let [moduleKey, module] of Object.entries<IModuleTemplate>(step)) {
                if (module.ttc < stepTTC) continue;
                stepTTC = module.ttc;
            }
            project_ttc += stepTTC;
        }

        if (project_ttc == formData.ttc) return;

        form.change('ttc', project_ttc);
    }*/

    return (
        <>
            <Step validator={props.validator} {...props}>
                <FormGroupContextProvider name={props.validator}>    
                    <ModuleManager calculateTTC={/*recalculateTTC TODO*/ () => true} />         
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Modules;