import { FormGroupContextProvider } from "react-admin";
import ModuleManager from "src/components/ModuleManager";
import { Step } from "src/components/FormStepper/Step";
import ModuleTemplateFields from "src/components/ModuleTemplateFields";
import { useFormContext } from "react-hook-form";
import { IModuleTemplate } from "src/util/types";

export type ModulesManagerStep = {
    getSource: Function,
    calculateTTC?: Function,
    validator: string
}

const Modules = (props: ModulesManagerStep) => {    
    const { getSource, validator, calculateTTC, ...rest } = props;
    const { setValue, getValues } = useFormContext();

    const recalculateTTC = () => {
        const modules = getValues('modules');
        if (!modules) return;

        let project_ttc = 0;
        for (let [stepKey, step] of Object.entries<IModuleTemplate[]>(modules)) {
            let stepTTC: number = 0;
            for (let [moduleKey, module] of Object.entries<IModuleTemplate>(step)) {
                if (parseInt(`${module.ttc}`) < stepTTC) continue;
                stepTTC = parseInt(`${module.ttc}`);
            }
            project_ttc += stepTTC;
        }

        if (project_ttc == getValues('ttc')) return;

        setValue('ttc', project_ttc);
    }

    return (
        <>
            <Step validator={props.validator} {...rest}>
                <FormGroupContextProvider name={props.validator}>    
                    <ModuleManager fields={<ModuleTemplateFields calculateTTC={recalculateTTC} />} isTemplate={true} />
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Modules;