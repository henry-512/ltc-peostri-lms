import { Box, Icon, makeStyles, Typography } from "@material-ui/core";
import NotificationsOffIcon from '@material-ui/icons/NotificationsOff';
import { useTranslate } from "react-admin";

const useStyles = makeStyles(theme => ({
    fontSizeLarge: {
        fontSize: '48px'
    }
}));

export type NotificationsEmptyProps = {
}

const NotificationsEmpty = (props: NotificationsEmptyProps) => {
    const classes = useStyles();
    const translate = useTranslate();

    return (
        <> 
            <Box minWidth='calc(300px - 2rem)' display="flex" justifyContent="center" alignItems="center" padding="1rem 1rem" flexDirection="column" >
                <NotificationsOffIcon fontSize="large" color='primary' classes={classes} />
                <Typography variant="subtitle1" >
                    {translate('notification.empty')}
                </Typography>
            </Box>
        </>
    )
}

export default NotificationsEmpty;