import { INotification, NotificationTypes } from "src/util/types";
import { styled } from '@mui/material/styles';
import { Box, Divider, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useCreatePath, useDataProvider } from "react-admin";
import classnames from "classnames";
import { dateFormatToString } from "src/util/dateFormatter";
import NotificationIcon from "src/components/notifications/NotificationIcon";

const PREFIX = 'NotificationsItem';

const classes = {
    root: `${PREFIX}-root`,
    read: `${PREFIX}-read`,
    iconWrapper: `${PREFIX}-iconWrapper`,
    infoWrapper: `${PREFIX}-infoWrapper`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        maxWidth: "400px",
        display: "flex",
        minHeight: "50px",
        alignItems: "center",
        padding: '.5rem .75rem',
        gap: '.75rem',
        transition: 'all .2s',
        color: theme.palette.primary.main,
        '&:hover': {
            backgroundColor: theme.palette?.borderColor?.main,
            transition: 'all .2s'
        }
    },

    [`& .${classes.read}`]: {
        backgroundColor: theme.palette?.borderColor?.light,
        transition: 'all .2s',
        color: "#808080"
    },

    [`& .${classes.iconWrapper}`]: {
        maxWidth: "25%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent'
    },

    [`& .${classes.infoWrapper}`]: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.87)',
    }
}));

export type NotificationsItemProps = {
    record: INotification
    last: boolean
    fetch: Function
    handleClose: Function
}

const NotificationsItem = (props: NotificationsItemProps) => {
    const createPath = useCreatePath();

    const dataProvider = useDataProvider();

    const markRead = () => {
        dataProvider.update<INotification>('notifications/read', { id: props.record.id, data: {}, previousData: { id: props.record.id } })
        .then(() => {
            return (props.fetch() && props.handleClose());
        })
        .catch(error => {
            return;
        })
    }
    
    return (
        (<Root>
            <Link to={createPath({ resource: `${props.record.sender.resource}`, id: props.record.sender.id, type: 'show' })} replace style={{
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
                        <Typography variant="body2">
                            {dateFormatToString(props.record.createdAt, true)}
                        </Typography>
                    </Box>
                </Box>
            </Link>
            {(props.last) ? null : <Divider />}
        </Root>)
    );
}

export default NotificationsItem;