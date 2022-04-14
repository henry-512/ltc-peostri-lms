import { styled } from '@mui/material/styles';
import { Create, useTranslate } from "react-admin";
import FormStepper from "src/packages/FormStepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
import validateProject from "../validation";

const PREFIX = 'index';

const classes = {
    root: `${PREFIX}-root`,
    content: `${PREFIX}-content`,
    usersTitle: `${PREFIX}-usersTitle`,
    taskBox: `${PREFIX}-taskBox`,
    fieldTitle: `${PREFIX}-fieldTitle`,
    alignCenter: `${PREFIX}-alignCenter`
};

const StyledCreate = styled(Create)((
    {
        theme
    }
) => ({
    [`& .${classes.root}`]: {},

    [`& .${classes.content}`]: {
        marginTop: theme.spacing(2)
    },

    [`& .${classes.usersTitle}`]: {
        display: 'flex',
        alignItems: 'center'
    },

    [`& .${classes.taskBox}`]: {
        font: 'inherit'
    },

    [`& .${classes.fieldTitle}`]: {
        borderBottom: '2px solid ' + theme.palette.primary.main,
        paddingBottom: '.25rem',
        lineHeight: '1',
        color: theme.palette.text.primary,
        marginBottom: '.25rem'
    },

    [`& .${classes.alignCenter}`]: {
        alignItems: 'center'
    }
}));

export default function AdminProjectCreate(props: any) {
    const translate = useTranslate();


    return (
        <StyledCreate title={translate('project.create.title')} {...props} transform={transformer}>
            <FormStepper validate={validateProject} create={true} initialValues={props.history?.location?.state?.record || {}}>

                <General classes={classes} title={translate('project.steps.general')} style={{ width: "100%" }} validator="general" {...props} />

                <Modules classes={classes} title={translate('project.steps.modules')} className={classes.content} validator="modules" {...props} />

            </FormStepper>
        </StyledCreate>
    );
}