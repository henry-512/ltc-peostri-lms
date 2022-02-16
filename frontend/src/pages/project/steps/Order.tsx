import { Step } from "../../../components/stepper/Step";
import { FormDataConsumer, FormGroupContextProvider } from "react-admin";
import { OrderContent } from "src/components/orders";

const Order = (props: any) => {

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
                                        <OrderContent formData={formData} getSource={getSource} />
                                   </>
                              )
                         }}
                    </FormDataConsumer>
               </FormGroupContextProvider>
          </Step>
     </>
)}

export default Order