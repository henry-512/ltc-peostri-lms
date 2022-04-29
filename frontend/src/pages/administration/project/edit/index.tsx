/**
* @file Administration Project edit file.
* @module AdministrationProjectEdit
* @category AdministrationProjectPage
* @author Braden Cariaga
*/

import { styled } from '@mui/material/styles';
import { Edit, useTranslate } from "react-admin";
import FormStepper from "src/components/FormStepper";
import General from "../steps/General";
import Modules from "../steps/Modules";
import transformer from "../transformer";
import validateProject from "../validation";

const PREFIX = 'AdminProjectEdit';

const classes = {
    root: `${PREFIX}-root`,
    content: `${PREFIX}-content`,
    usersTitle: `${PREFIX}-usersTitle`,
    taskBox: `${PREFIX}-taskBox`,
    fieldTitle: `${PREFIX}-fieldTitle`,
    alignCenter: `${PREFIX}-alignCenter`
};

const StyledEdit = styled(Edit)(({ theme }) => ({
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

const AdminProjectEdit = (props: any) => {
    const translate = useTranslate();

    return (
        <StyledEdit title={translate('project.edit.title')} {...props} transform={transformer}>
            <FormStepper validate={validateProject} {...props}>

                <General classes={classes} title={translate('project.steps.general')} style={{ width: "100%" }} validator="general" {...props} />

                <Modules classes={classes} title={translate('project.steps.modules')} className={classes.content} validator="modules" {...props} />

                {/*<Review classes={ title={translate('project.steps.review')} className={classes.content} validator="" {...props}/>*/}

            </FormStepper>
        </StyledEdit>
    );
}

export default AdminProjectEdit;