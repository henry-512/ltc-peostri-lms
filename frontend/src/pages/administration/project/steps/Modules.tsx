import { FormGroupContextProvider } from "react-admin";
import ModuleManager from "src/components/ModuleManager";
import { useFormContext } from "react-hook-form";
import { IModule } from "src/util/types";
import { Step } from "src/components/FormStepper/Step";


const Modules = (props: any) => {
    const { getValues, setValue } = useFormContext();

    const recalculateTTC = () => {
        const modules = getValues('modules');
        if (!modules) return;

        let project_ttc = 0;
        for (let [stepKey, step] of Object.entries<IModule[]>(modules)) {
            let stepTTC: number = 0;
            for (let [moduleKey, module] of Object.entries<IModule>(step)) {
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
            <Step validator={props.validator} {...props}>
                <FormGroupContextProvider name={props.validator}>    
                    <ModuleManager calculateTTC={recalculateTTC} />         
                </FormGroupContextProvider>
            </Step>
        </>
    )
}

export default Modules;