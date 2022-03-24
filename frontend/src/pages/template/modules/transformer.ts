import { IModuleTemplate, ITaskTemplate } from "src/util/types";

const transformer = (data: IModuleTemplate) => {

    //Remove empty steps.
    for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(data.tasks)) {
        //console.log(stepKey)
        if (step.length <= 0) {
            delete data.tasks[stepKey];
        }
    }

    return {
        ...data
    }
}

export default transformer;