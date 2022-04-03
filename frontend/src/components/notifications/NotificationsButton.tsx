import { Button, makeStyles } from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';

const useStyles = makeStyles(theme => {{
    root: {
        minWidth: '0'
    }
}})

type NotificationsButtonProps = {

}

const NotificationsButton = (props: NotificationsButtonProps) => {
    const classes = useStyles();

    return (
        <>
            <Button variant="contained" color="primary" classes={classes}>
                <NotificationsIcon />
            </Button>
        </>
    )
}

export default NotificationsButton;