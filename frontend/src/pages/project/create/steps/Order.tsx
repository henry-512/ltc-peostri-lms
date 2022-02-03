import { Step } from "../../../../components/stepper/Step";
import { FormDataConsumer, useTranslate } from "react-admin";

const Order = (props: any) => {
const translate = useTranslate();
return (
     <>
          <Step>
               <FormDataConsumer>
                    {({ 
                         formData,
                         scopedFormData,
                         getSource,
                         ...rest 
                    }: any) => {
                         console.log(formData);
                         return (
                              <div>

                              </div>
                         )
                    }}
               </FormDataConsumer>
          </Step>
     </>
)}

export default Order