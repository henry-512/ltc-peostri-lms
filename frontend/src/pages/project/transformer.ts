import { IProject } from "src/util/types";

const transformer = (data: IProject) => {
    //Remove form values used for client processing.
    delete data.auto_assign;
    delete data.module_template_id;
    data.comments = [];

    //Remove empty steps.
    for (const mKey in data.modules) {
        if (data.modules[mKey].length <= 0) {
            delete data.modules[mKey];
            continue;
        }

        for (let i = 0; i < data.modules[mKey].length; i++) {
            const module = data.modules[mKey][i];
            //delete data.modules[mKey][i].waive_module;
            for (const tKey in module.tasks) {
                if (module.tasks[tKey].length <= 0) {
                    delete data.modules[mKey][i].tasks[tKey];
                }
            }
        }
    }

    return {
        ...data
    }
}

export default transformer;