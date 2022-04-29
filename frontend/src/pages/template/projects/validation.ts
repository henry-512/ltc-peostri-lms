/**
* @file Template Project validation method.
* @module TemplateProjectValidationMethod
* @category TemplateProjectPage
* @author Braden Cariaga
*/

import { FieldValues } from "react-hook-form";

export default function validateProjectTemplate(project: FieldValues) {
    const errors: any = {};

    if (project.modules) {
        if (Object.keys(project.modules).length <= 0) {
            errors.modules = 'No modules have been added to the project'
        }
    } else {
        errors.modules = 'No modules have been added to the project'
    }

    // Note: Module and Task Validation is done directly on the components input fields.

    return errors
}