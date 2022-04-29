/**
* @file Administration Project validation method.
* @module AdministrationProjectValidationMethod
* @category AdministrationProjectPage
* @author Braden Cariaga
*/

import { FieldValues } from "react-hook-form";

export default function validateProject(project: FieldValues) {
    const errors: any = {};

    if (!project.title) {
        errors.title = 'The title is required';
    }

    if (!project.start) {
        errors.start = 'The start date is required';
    }

    /*if (!project.end) {
        errors.end = 'The end date is required';
    }*/

    if (project.auto_assign) {
        if (!project.users || project.users.length <= 0) {
            errors.users = 'If auto assign is active, you must select at least one user';
        }
    }

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