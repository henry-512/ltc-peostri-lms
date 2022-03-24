import { IProject } from "src/util/types";

export default function validateProjectTemplate(project: IProject) {
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