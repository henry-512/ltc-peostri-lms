import { Step } from "../../../components/stepper/Step";
import { FormDataConsumer, FormGroupContextProvider } from "react-admin";
import { ModuleCreator } from "src/components/modules";

const Modules = (props: any) => {

return (
     <>
          <Step validator={props.validator} backText="Changes are NOT saved when going back!" {...props}>
               <FormGroupContextProvider name={props.validator}>
                    <FormDataConsumer>
                         {({ 
                              formData,
                              scopedFormData,
                              getSource,
                              ...rest 
                         }: any) => {
                              return (
                                   <>
                                        <ModuleCreator formData={formData} getSource={getSource} />
                                   </>
                              )
                         }}
                    </FormDataConsumer>
               </FormGroupContextProvider>
          </Step>
     </>
)}

export default Modules;