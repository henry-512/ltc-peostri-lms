import { makeStyles } from "@material-ui/core";
import { Edit, useTranslate } from "react-admin";
import transformer from "../transformer";

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
        <Edit title={translate('user.edit.title')} {...props} transform={transformer}>

        </Edit>
    )
}

export default ProjectEdit;