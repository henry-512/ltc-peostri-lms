import { makeStyles } from "@material-ui/core";
import { Create, SimpleForm, useTranslate } from "react-admin";
import { TemplateToolbar } from "src/components/templates";
import ProjectTemplateFields from "src/components/templates/ProjectTemplateFields";
import transformer from "../transformer";
import validateProjectTemplate from "../validation";

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

export default function ProjectTemplateCreate(props: any) {
    const translate = useTranslate();
    const classes = useStyles();
    const search = new URLSearchParams(props.location.search);

    return (
        <Create title={translate('project.create.title')} {...props} transform={transformer}>
            <SimpleForm
                validate={validateProjectTemplate}
                toolbar={
                    <TemplateToolbar
                        create={true}
                    />
                }
            >
                <ProjectTemplateFields />
            </SimpleForm>
        </Create>
    )
}