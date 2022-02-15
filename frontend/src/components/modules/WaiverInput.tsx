import { useCallback } from "react";
import { BooleanInput } from "react-admin";
import { useForm } from "react-final-form";
import { ITaskWaiverReview } from "src/util/types";

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

     const makeWaiveTasks = (sourceString: string) => {
          const moduleInfo = sourceString.split('.')[0].split('[');
          const module = moduleInfo[0];
          const moduleNumber = moduleInfo[1].replace(']', '');

          form.change(`${module}[${moduleNumber}].waived`, true);
          form.change(`${module}[${moduleNumber}].tasks`, createWaiverTasks());
     }

     const removeWaiveTasks = (sourceString: string) => {
          const moduleInfo = sourceString.split('.')[0].split('[');
          const module = moduleInfo[0];
          const moduleNumber = moduleInfo[1].replace(']', '');

          form.change(`${module}[${moduleNumber}].waived`, false)
          form.change(`${module}[${moduleNumber}].tasks`, [{}]);
     }

     const formChange = (value: any) => {
          if (!value) {
               removeWaiveTasks(props.source);
          } else {
               makeWaiveTasks(props.source);
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