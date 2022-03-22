import { Step } from "../../../../components/stepper/Step";
import { FormDataConsumer, FormGroupContextProvider } from "react-admin";
import { ModuleManager } from "src/components/modules";

const Modules = (props: any) => {

return (
     <>
          <Step validator={props.validator} {...props}>
               <FormGroupContextProvider name={props.validator}>    
                    <ModuleManager />         
               </FormGroupContextProvider>
          </Step>
     </>
)}

export default Modules;