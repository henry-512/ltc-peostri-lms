import { PopoverOrigin } from "@material-ui/core";
import { useEffect, useState } from "react";
import NotificationsMenu from "./NotificationsMenu";
import NotificationsButton from "./NotificationsButton";
import { Loading, Error, useQuery, useDataProvider, useNotify } from 'react-admin';
import { INotification } from "src/util/types";

export type NotificationsButtonProps = {
    label: string
}

const AnchorOrigin: PopoverOrigin = {
    vertical: 'bottom',
    horizontal: 'right',
};

const TransformOrigin: PopoverOrigin = {
    vertical: 'top',
    horizontal: 'right',
};

const NotificationsWidget = (props: NotificationsButtonProps) => {
    const { label } = props;
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);
    
    const handleMenu = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const id = open ? 'notifications-popover' : undefined;

    const dataProvider = useDataProvider();
    const [notifications, setNotifications] = useState([] as INotification[]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = () => {
        setLoading(true);
        dataProvider.getList<INotification>('user/notifications', { filter: {}, pagination: { page: 1, perPage: 5 }, sort: { field: "read", order: "ASC" } })
        .then(({ data }) => {
            setNotifications(data);
        })
        .catch(error => {
            return;
        })
        .finally(() => {
            setLoading(false);
        })
    }

    useEffect(() => fetchNotifications(), [])

    const markAllRead = () => {
        dataProvider.update<INotification>('user/notifications/readall', { id: "", data: {}, previousData: { id: "" } })
        .then(() => {
            // @ts-ignore
            return fetchNotifications();
        })
        .catch(error => {
            return;
        })
        .finally(() => {
            handleClose();
        })
    }

    return (
        <>
            <NotificationsButton id={id} label={label} handleMenu={handleMenu} hasNew={(notifications && notifications.length > 0)} />
            <NotificationsMenu 
                id={id}
                anchorEl={anchorEl} 
                AnchorOrigin={AnchorOrigin} 
                TransformOrigin={TransformOrigin} 
                open={open} 
                handleClose={handleClose} 
                data={notifications}
                loading={loading}
                markAllRead={markAllRead}
            />
        </>
    )
}

export default NotificationsWidget;