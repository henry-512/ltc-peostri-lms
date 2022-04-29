/**
* @file Template Module Edit file.
* @module TemplateModuleEdit
* @category TemplateModulesPage
* @author Braden Cariaga
*/

import { Edit, useTranslate } from "react-admin";
import TemplateEditToolbar from "src/components/TemplateEditToolbar";
import FormStepper from "src/components/FormStepper";
import General from "../steps/General";
import Tasks from "../steps/Tasks";
import transformer from "../transformer";
import validateModuleTemplate from "../validation";

const ModuleTemplateEdit = (props: any) => {
    const translate = useTranslate();

    return (
        <Edit title={translate('project.edit.title')} transform={transformer} redirect="show" actions={<TemplateEditToolbar />}>
            <FormStepper validate={validateModuleTemplate} {...props}>

                <General title={translate('template.module.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Tasks title={translate('template.module.steps.tasks')} validator="tasks" getSource={(src: string) => src} {...props} />

            </FormStepper>
        </Edit>
    )
}

export default ModuleTemplateEdit;