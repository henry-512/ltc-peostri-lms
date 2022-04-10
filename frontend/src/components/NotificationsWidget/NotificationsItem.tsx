import { INotification, NotificationTypes } from "src/util/types";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import ViewModuleIcon from '@material-ui/icons/ViewModule';
import AssignmentIcon from '@material-ui/icons/Assignment';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { Box, Divider, makeStyles, Typography } from "@material-ui/core";
import { Link } from "react-router-dom";
import { linkToRecord, useDataProvider } from "react-admin";
import classnames from "classnames";

export type NotificationIconProps = {
    type: NotificationTypes
}

const NotificationIcon = (props: NotificationIconProps) => {
    switch(props.type) {
        case 'PROJECT':
            return <CheckBoxIcon fontSize="large" />
        case 'MODULE':
            return <ViewModuleIcon fontSize="large" />
        case 'TASK':
            return <AssignmentIcon fontSize="large" />
        case 'USER':
            return <AccountCircleIcon fontSize="large" />
        default:
            return <CheckBoxIcon fontSize="large" />
    }
}

const useStyles = makeStyles(theme => ({
    root: {
        maxWidth: "400px",
        display: "flex",
        minHeight: "50px",
        alignItems: "center",
        transition: 'all .3s',
        padding: '.5rem .75rem',
        gap: '.75rem',
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette?.borderColor?.dark,
            transition: 'all .3s'
        }
    },
    read: {
        backgroundColor: theme.palette?.borderColor?.light,
        transition: 'all .3s',
        color: "#808080"
    },
    iconWrapper: {
        maxWidth: "25%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent'
    },
    infoWrapper: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.87)',
    }
}))

export type NotificationsItemProps = {
    record: INotification
    last: boolean
}

const NotificationsItem = (props: NotificationsItemProps) => {
    const recordLink = linkToRecord(`${props.record.sender.resource}`, props.record.sender.id, 'show');
    const classes = useStyles();
    const dataProvider = useDataProvider();

    const markRead = () => {
        dataProvider.update<INotification>('notifications/read', { id: props.record.id, data: {}, previousData: { id: props.record.id } })
        .then(() => {
            return;
        })
        .catch(error => {
            return;
        })
    }
    
    return (
        <>
            <Link to={recordLink} style={{
                textDecoration: 'none'
            }} onClick={markRead}>
                <Box className={classnames(classes.root, {
                    [classes.read]: props.record.read
                })}>
                    <Box className={classes.iconWrapper} >
                        <NotificationIcon type={props.record.type} />
                    </Box>
                    <Box className={classes.infoWrapper}>
                        <Typography variant="subtitle1">
                            {props.record.content}
                        </Typography>
                        <Typography variant="caption">
                            some Texzt
                        </Typography>
                    </Box>
                </Box>
            </Link>
            {(props.last) ? null : <Divider />}
        </>
    )
}

export default NotificationsItem;