import { Step } from "../../../components/stepper/Step";
import { FormDataConsumer, FormGroupContextProvider } from "react-admin";
import { ModuleManager } from "src/components/modules";
import { IModuleTemplate } from "src/util/types";
import { useForm } from "react-final-form";

const Modules = (props: any) => {
    const form = useForm();

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

        console.log('project-recreation')
        if (project_ttc == formData.ttc) return;
        console.log('project-recreation3')

        form.change('ttc', project_ttc);
    }

    return (
        <>
            <Step validator={props.validator} {...props}>
                <FormGroupContextProvider name={props.validator}>    
                    <ModuleManager isCreate={props.isCreate} calculateTTC={recalculateTTC} />         
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Modules;