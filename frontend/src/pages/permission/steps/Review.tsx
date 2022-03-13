import { FormDataConsumer } from "react-admin";
import { Step } from "src/components/stepper/Step";

const Review = (props: any) => {
return (
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
)}

export default Review