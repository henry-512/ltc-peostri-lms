import { makeStyles } from "@material-ui/core";
import { Edit, SimpleForm, useTranslate } from "react-admin";
import { ModuleTemplateFields, TemplateToolbar } from "src/components/templates";
import transformer from "../transformer";
import validateProjectTemplate from "../validation";
import validateProject from "../validation";

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

const ProjectTemplateEdit = (props: any) => {
    const translate = useTranslate();
    const classes = useStyles();

    return (
        <Edit title={translate('template.project.layout.edit_title')} {...props} transform={transformer}>
            <SimpleForm
                validate={validateProjectTemplate}
                toolbar={
                    <TemplateToolbar
                        create={false}
                    />
                }
            >
                <ModuleTemplateFields getSource={(src: string) => src} />
            </SimpleForm>
        </Edit>
    )
}

export default ProjectTemplateEdit;