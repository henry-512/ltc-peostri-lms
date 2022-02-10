import { Step } from "../../../../components/stepper/Step";
import { FormDataConsumer, useTranslate } from "react-admin";
import { OrderContent } from "src/components/orders";

const Order = (props: any) => {
const translate = useTranslate();
return (
     <>
          <Step backText={translate('project.create.warnings.order_back')} {...props}>
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
          </Step>
     </>
)}

export default Order