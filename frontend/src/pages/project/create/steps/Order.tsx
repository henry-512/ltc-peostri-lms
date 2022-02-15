import { Step } from "../../../../components/stepper/Step";
import { FormDataConsumer, FormGroupContextProvider, useTranslate } from "react-admin";
import { OrderContent } from "src/components/orders";

const Order = (props: any) => {
const translate = useTranslate();
return (
     <>
          <Step validator={props.validator} {...props}>
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