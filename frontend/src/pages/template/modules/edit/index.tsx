import { Edit, SimpleForm, useTranslate } from "react-admin";
import FormStepper from "src/components/FormStepper";
import { ModuleTemplateFields, TemplateToolbar } from "src/components/templates";
import General from "../steps/General";
import Tasks from "../steps/Tasks";
import transformer from "../transformer";
import validateModuleTemplate from "../validation";

const ModuleTemplateEdit = (props: any) => {
    const translate = useTranslate();

    return (
        <Edit title={translate('project.edit.title')} {...props} transform={transformer}>
            <FormStepper validate={validateModuleTemplate} {...props}>

                <General title={translate('template.module.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Tasks title={translate('template.module.steps.tasks')} validator="tasks" getSource={(src: string) => src} {...props} />

            </FormStepper>
        </Edit>
    )
}

export default ModuleTemplateEdit;