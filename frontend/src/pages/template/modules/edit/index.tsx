import { Edit, SimpleForm, useTranslate } from "react-admin";
import { ModuleTemplateFields, TemplateToolbar } from "src/components/templates";
import transformer from "../transformer";
import validateModuleTemplate from "../validation";

const ModuleTemplateEdit = (props: any) => {
     const translate = useTranslate();

     return (
          <Edit title={translate('project.edit.title')} {...props} transform={transformer}>
               <SimpleForm
                validate={validateModuleTemplate}
                toolbar={
                    <TemplateToolbar
                        create={true}
                    />
                }
            >
                <ModuleTemplateFields getSource={(src: string) => src} />
            </SimpleForm>
          </Edit>
     )
}

export default ModuleTemplateEdit;