import { Create, useTranslate } from "react-admin";
import FormStepper from "src/packages/FormStepper";
import General from "../steps/General";
import Tasks from "../steps/Tasks";
import transformer from "../transformer";
import validateModuleTemplate from "../validation";

export default function ModuleTemplateCreate(props: any) {
    const translate = useTranslate();

    return (
        <Create title={translate('template.module.layout.create_title')} {...props} transform={transformer}>
            <FormStepper validate={validateModuleTemplate} create={true}>

                <General title={translate('template.module.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Tasks title={translate('template.module.steps.tasks')} validator="tasks" getSource={(src: string) => src} {...props} />

            </FormStepper>
        </Create>
    )
}