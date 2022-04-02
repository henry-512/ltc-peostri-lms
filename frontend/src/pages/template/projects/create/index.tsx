import { makeStyles } from "@material-ui/core";
import { Create, SimpleForm, useTranslate } from "react-admin";
import FormStepper from "src/components/FormStepper";
import { TemplateToolbar } from "src/components/templates";
import ProjectTemplateFields from "src/components/templates/ProjectTemplateFields";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
import validateProjectTemplate from "../validation";

export default function ProjectTemplateCreate(props: any) {
    const translate = useTranslate();

    return (
        <Create title={translate('template.project.layout.create_title')} {...props} transform={transformer}>
            <FormStepper validate={validateProjectTemplate} create={true} {...props}>
                <General title={translate('template.project.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Modules title={translate('template.project.steps.modules')} validator="modules" getSource={(src: string) => src} {...props} />
            </FormStepper>
        </Create>
    )
}