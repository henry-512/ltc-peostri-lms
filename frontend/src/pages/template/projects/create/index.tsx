import { Create, useTranslate } from "react-admin";
import FormStepper from "src/packages/FormStepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
import validateProjectTemplate from "../validation";

export default function ProjectTemplateCreate(props: any) {
    const translate = useTranslate();

    return (
        <Create title={translate('template.project.layout.create_title')} {...props} transform={transformer} redirect="list">
            <FormStepper validate={validateProjectTemplate} create={true} {...props}>
                <General title={translate('template.project.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Modules title={translate('template.project.steps.modules')} validator="modules" getSource={(src: string) => src} {...props} />
            </FormStepper>
        </Create>
    )
}