/**
* @file Template Project Edit file.
* @module TemplateProjectEdit
* @category TemplateProjectsPage
* @author Braden Cariaga
*/

import { Edit, useTranslate } from "react-admin";
import TemplateEditToolbar from "src/components/TemplateEditToolbar";
import FormStepper from "src/components/FormStepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
import validateProjectTemplate from "../validation";

const ProjectTemplateEdit = (props: any) => {
    const translate = useTranslate();

    return (
        <Edit title={translate('template.project.layout.edit_title')} transform={transformer} redirect="show" actions={<TemplateEditToolbar />}>
            <FormStepper validate={validateProjectTemplate} {...props}>
                <General title={translate('template.project.steps.general')} validator="general" getSource={(src: string) => src} {...props} />

                <Modules title={translate('template.project.steps.modules')} validator="modules" getSource={(src: string) => src} {...props} />
            </FormStepper>
        </Edit>
    )
}

export default ProjectTemplateEdit;