import { makeStyles } from "@material-ui/core";
import { Create, SimpleForm, useTranslate } from "react-admin";
import { ModuleTemplateFields, TemplateToolbar } from "src/components/templates";
import transformer from "../transformer";
import validateModuleTemplate from "../validation";

const useStyles = makeStyles(theme => ({
     root: {},
     content: {
          marginTop: theme.spacing(2)
     },
     usersTitle: {
          display: 'flex', 
          alignItems: 'center'
     },
     taskBox: {
          font: 'inherit'
     },
     fieldTitle: {
          borderBottom: '2px solid ' + theme.palette.primary.main,
          paddingBottom: '.25rem',
          lineHeight: '1',
          color: theme.palette.text.primary,
          marginBottom: '.25rem'
     },
     alignCenter: {
          alignItems: 'center'
     }
}));

export default function ModuleTemplateCreate(props: any) {
     const translate = useTranslate();

     return (
          <Create title={translate('template.module.layout.create_title')} {...props} transform={transformer}>
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
          </Create>
     )
}