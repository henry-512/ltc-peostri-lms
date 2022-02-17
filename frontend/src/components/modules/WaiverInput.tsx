import get from "lodash.get";
import { useCallback, useState } from "react";
import { BooleanInput } from "react-admin";
import { useForm } from "react-final-form";
import { ITaskStep, ITaskWaiverReview } from "src/util/types";

type WaiverInputProps = {
     source: string,
     setShowSteps: Function
}

const WaiverInput = (props: WaiverInputProps): JSX.Element => {
     const form = useForm();
     const formData = form.getState().values;
     const [cacheTasks, setCacheTasks] = useState(undefined);

     const createWaiverTasks = (): ITaskStep => {
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

          return {
               ["key-0"]: [
                    waiveApproval
               ]
          };
     }

     const addWaiveTasks = () => {
          //Set the waive status to true on the form.
          form.change(props.source + ".waive_module", true);

          //Save steps for caching.
          setCacheTasks(get(formData, props.source + ".tasks"));

          //Set the tasks.
          form.change(props.source + ".tasks", createWaiverTasks());

          props.setShowSteps(true);
     }

     const removeWaiveTasks = () => {
          //Set the waive status to true on the form.
          form.change(props.source + ".waive_module", false);

          if (cacheTasks) {
               form.change(props.source + ".tasks", cacheTasks);
          } else {
               form.change(props.source + ".tasks", {
                    ["0"]: [{}]
               })
          }

          props.setShowSteps(false);
     }

     const formChange = (value: any) => {
          if (!value) {
               removeWaiveTasks();
          } else {
               addWaiveTasks();
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
               <BooleanInput label="project.layout.waive_module" source={props.source + ".waive_module"} helperText=" " defaultValue={false} onChange={handleChange}/>
          </>
     )
}

export default WaiverInput;