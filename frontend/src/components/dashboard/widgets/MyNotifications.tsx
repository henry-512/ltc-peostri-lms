import CardWithIcon from "./base/CardWithIcon"
import { INotification } from "src/util/types";
import { Box, Button, Divider, List, ListItem, ListItemText, styled, Typography } from "@mui/material";
import { Identifier, LinearProgress, useCreatePath, useGetList, useTranslate, useUpdate } from "react-admin";
import { Link } from "react-router-dom";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';

export type ProjectCountProps = {
    title?: string
}

const classes = {
    fontSizeLarge: `NotificationsEmpty-fontSizeLarge`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.fontSizeLarge}`]: {
        fontSize: '48px'
    }
}));

const NotificationsEmpty = () => {
    const translate = useTranslate();
    return (
        <Root>
            <Box minWidth='calc(300px - 2rem)' display="flex" justifyContent="center" alignItems="center" padding="1rem 1rem" flexDirection="column" >
                <NotificationsOffIcon fontSize="large" color='primary' classes={classes} />
                <Typography variant="subtitle1" >
                    {translate('notification.empty')}
                </Typography>
            </Box>
        </Root>
    );
}

const MyNotifications = (props: ProjectCountProps) => {
    const translate = useTranslate();
    const createPath = useCreatePath();
    const [update] = useUpdate();
    
    const { data: notifications, total, isLoading } = useGetList<INotification>('notifications', {
        filter: {},
        sort: { field: 'read', order: 'ASC' },
        pagination: { page: 1, perPage: 8 },
    });

    const display = isLoading ? 'none' : 'block';

    const markRead = (id: Identifier) => {
        update('notifications/read', { id: id, data: {}, previousData: { id: id } })
        .then(() => {
            return;
        })
        .catch(error => {
            return;
        })
    }
    
    return (
        <CardWithIcon icon={NotificationsNoneIcon} to={createPath({ resource: `notifications`, type: 'list' })} replace={true} title={props.title || "dashboard.widget.my_notifications.title"} subtitle={total}>
            {(notifications) ? (
                <List sx={{ display }}>
                    {notifications?.map((record: INotification) => (
                        <ListItem
                            key={record.id}
                            button
                            component={Link}
                            to={createPath({ resource: `notifications`, id: record.id, type: 'show' })}
                            replace={true}
                            onClick={() => markRead(record.id)}
                            alignItems="flex-start"
                        >
                            <ListItemText
                                primary={record.content}
                                secondary={String(record.read)}
                                sx={{
                                    overflowY: 'hidden',
                                    height: '4em',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    paddingRight: 0,
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
            ) : (
                (isLoading) ? <Box display="flex" justifyContent="center"><LinearProgress /></Box> : <NotificationsEmpty />
            )}
            <Divider />
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to={createPath({ resource: `notifications`, type: 'list' })}
                size="small"
                color="primary"
                replace={true}
            >
                <Box p={1} sx={{ color: 'primary.main' }}>
                    {translate('dashboard.widget.my_notifications.all')}
                </Box>
            </Button>
        </CardWithIcon>
    )
}

export default MyNotifications;