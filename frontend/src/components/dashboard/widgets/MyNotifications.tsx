import CardWithIcon from "./base/CardWithIcon"
import { INotification } from "src/util/types";
import { Box, Button, List, ListItem, ListItemText } from "@mui/material";
import { useGetList, useTranslate } from "react-admin";
import { Link } from "react-router-dom";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

export type ProjectCountProps = {
    title?: string
}

const MyProjects = (props: ProjectCountProps) => {
    const translate = useTranslate();
    const { data: notifications, total, isLoading } = useGetList<INotification>('notifications', {
        filter: {},
        sort: { field: 'read', order: 'DESC' },
        pagination: { page: 1, perPage: 100 },
    });

    const display = isLoading ? 'none' : 'block';
    
    return (
        <CardWithIcon icon={NotificationsNoneIcon} to={"/notifications"} title={props.title || "dashboard.widget.my_notifications.title"} subtitle={total}>
            <List sx={{ display }}>
                {notifications?.map((record: INotification) => (
                    <ListItem
                        key={record.id}
                        button
                        component={Link}
                        to={`/reviews/${record.id}`}
                        alignItems="flex-start"
                    >
                        <ListItemText
                            primary={record.content}
                            secondary={record.read}
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
            <Box flexGrow={1}>&nbsp;</Box>
            <Button
                sx={{ borderRadius: 0 }}
                component={Link}
                to="/notifications"
                size="small"
                color="primary"
            >
                <Box p={1} sx={{ color: 'primary.main' }}>
                    {translate('dashboard.widget.my_notifications.all')}
                </Box>
            </Button>
        </CardWithIcon>
    )
}

export default MyProjects;