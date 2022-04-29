/**
* @file Template Module transformer method.
* @module TemplateModuleTransformerMethod
* @category TemplateModulesPage
* @author Braden Cariaga
*/


import { IModuleTemplate, ITaskTemplate } from "src/util/types";
import cloneDeep from 'lodash.clonedeep';

const transformer = (moduleData: IModuleTemplate) => {
    let data = cloneDeep(moduleData);
    data.ttc = parseInt(`${data.ttc}`);

    /* Removing empty steps. */
    let stepCounter = 0;
    for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(data.tasks)) {
        if (step.length <= 0) {
            delete data.tasks[stepKey];
            continue;
        }

        let stepKeyInt = parseInt(stepKey.split('-')[1]);
        if (stepCounter !== stepKeyInt) {
            data.tasks["key-" + stepCounter] = data.tasks[stepKey];
            delete data.tasks[stepKey];
        }
        stepCounter++;
    }

    return {
        ...data
    }
}

export default transformer;