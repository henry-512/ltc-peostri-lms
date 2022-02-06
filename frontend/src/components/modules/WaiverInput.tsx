import { useCallback } from "react";
import { BooleanInput } from "react-admin";
import { useForm } from "react-final-form";
import { ITaskWaiver, ITaskWaiverReview } from "../../../../lms/types";

const WaiverInput = (props: any): JSX.Element => {
     const form = useForm();

     const createWaiverTasks = (): [waiveApproval: ITaskWaiverReview] => {
          /*const waiveTask: ITaskWaiver =  {
               title: "Module Waiver",
               status: "IN_PROGRESS",
               type: "MODULE_WAIVER"
          }*/
          const waiveApproval: ITaskWaiverReview = {
               title: "Module Waiver Approval",
               status: "AWAITING",
               type: "MODULE_WAIVER_APPROVAL"
          }

          return [waiveApproval];
     }

     const createWaiverSteps = () => {
          return {
               step_one: [0],
               step_two: [1]
          }
     }

     const makeWaiveSteps = (sourceString: string) => {
          const moduleInfo = sourceString.split('.')[0].split('[');
          const module = moduleInfo[0];
          const moduleNumber = moduleInfo[1].replace(']', '');

          form.change(`${module}[${moduleNumber}].waived`, true);
          form.change(`${module}[${moduleNumber}].tasks`, createWaiverTasks());
          form.change(`${module}[${moduleNumber}].steps`, createWaiverSteps());
     }

     const removeWaiveSteps = (sourceString: string) => {
          const moduleInfo = sourceString.split('.')[0].split('[');
          const module = moduleInfo[0];
          const moduleNumber = moduleInfo[1].replace(']', '');

          form.change(`${module}[${moduleNumber}].waived`, false)
          form.change(`${module}[${moduleNumber}].tasks`, []);
          form.change(`${module}[${moduleNumber}].steps`, []);
     }

     const formChange = (value: any) => {
          if (!value) {
               removeWaiveSteps(props.source);
          } else {
               makeWaiveSteps(props.source);
          }
     }

     const handleChange = useCallback(
          (value: any) => {
               formChange(value);
          },
          [formChange]
     );

     return (
          <>
               <BooleanInput label="project.create.layout.waive_module" source="waive_module" helperText=" " defaultValue={false} onChange={handleChange} {...props}/>
          </>
     )
}

export default WaiverInput;