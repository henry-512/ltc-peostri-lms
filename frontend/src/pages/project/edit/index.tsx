import { makeStyles } from "@material-ui/core";
import { Edit, useTranslate } from "react-admin";
import Stepper from "../../../components/stepper/Stepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
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

const ProjectEdit = (props: any) => {
    const translate = useTranslate();
    const classes = useStyles();


    return (
        <Edit title={translate('project.edit.title')} {...props} transform={transformer}>
            <Stepper validate={validateProject} {...props}>

                <General classes={classes} title={translate('project.steps.general')} style={{ width: "100%" }} validator="general" {...props} />

                <Modules classes={classes} title={translate('project.steps.modules')} className={classes.content} validator="modules" {...props} />

                {/*<Review classes={classes} title={translate('project.steps.review')} className={classes.content} validator="" {...props}/>*/}

            </Stepper>
        </Edit>
    )
}

export default ProjectEdit;