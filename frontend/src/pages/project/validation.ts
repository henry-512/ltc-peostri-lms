import { IProject } from "src/util/types";

export default function validateProject(project: IProject) {
     const errors: any = {};

     if (!project.title) {
          errors.title = 'The title is required';
     }
     
     if (!project.start) {
          errors.start = 'The start date is required';
     }

     if (!project.end) {
          errors.end = 'The end date is required';
     }

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