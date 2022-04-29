/**
* @file Template Project transformer method.
* @module TemplateProjectTransformerMethod
* @category TemplateProjectsPage
* @author Braden Cariaga
*/

import { IProject } from "src/util/types";
import cloneDeep from 'lodash.clonedeep';

const transformer = (projectData: IProject) => {
    let data = cloneDeep(projectData);

    /* This is deleting the module_template_id from the data. */
    delete data.module_template_id;

    /* This is a way to convert a string to a number. */
    data.ttc = parseInt(`${data.ttc}`);

    /* Removing empty steps from the data. */
    let mStepCounter = 0; //Keep track of current step, in case of deletion and need for refactoring.
    for (const mKey in data.modules) {
        if (data.modules[mKey].length <= 0) {
            delete data.modules[mKey]; //Remove empty step.
            continue;
        }

        for (let i = 0; i < data.modules[mKey].length; i++) {
            const module = data.modules[mKey][i];

            module.ttc = parseInt(`${module.ttc}`);

            let tStepCounter = 0; //Keep track of current step, in case of deletion and need for refactoring.
            for (const tKey in module.tasks) {
                if (module.tasks[tKey].length <= 0) {
                    delete data.modules[mKey][i].tasks[tKey]; //Remove empty step.
                }

                //Check if this is the right step, if not refactor.
                let tKeyInt = parseInt(tKey.split('-')[1]);
                if (tStepCounter !== tKeyInt) {
                    data.modules[mKey][i].tasks["key-" + tStepCounter] = data.modules[mKey][i].tasks[tKey];
                    delete data.modules[mKey][i].tasks[tKey]; //Remove old.
                }

                tStepCounter++; //Increment step counter because its valid.
            }
        }

        //Check if this is the right step, if not refactor.
        let mKeyInt = parseInt(mKey.split('-')[1]);
        if (mStepCounter !== mKeyInt) {
            data.modules["key-" + mStepCounter] = data.modules[mKey];
            delete data.modules[mKey]; //Remove old. 
        }

        mStepCounter++; //Increment step counter because its valid.
    }

    return {
        ...data
    }
}

export default transformer;