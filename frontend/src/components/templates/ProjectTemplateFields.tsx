import { Grid, makeStyles, Typography } from "@material-ui/core";
import { NumberInput, TextInput, useTranslate } from "react-admin";
import { ModuleManager } from "../modules";

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

interface ProjectTemplateFieldsProps {

}

const ProjectTemplateFields = (props: ProjectTemplateFieldsProps) => {
    const translate = useTranslate();
    const classes = useStyles();

    return (
        <>
            <Grid container spacing={0} className={classes.content}>
                <Grid item xs={12}>
                    <Grid container>
                        <Grid item xs={6} className={classes.usersTitle}>
                            <Typography variant="h6" className={classes.fieldTitle}>
                                {translate('project.layout.general')}
                            </Typography>
                        </Grid>
                    </Grid>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextInput
                                label={translate('project.fields.title')}
                                source="title"
                                required
                                fullWidth
                                helperText=" "
                            />
                        </Grid>
                        <Grid item xs={3}>
                            <NumberInput
                                label={translate('project.fields.start')}
                                source="start"
                                required
                                fullWidth
                                helperText=" "
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
            <ModuleManager />
        </>
    )
}

export default ProjectTemplateFields;