import { PopoverOrigin } from "@material-ui/core";
import { useEffect, useState } from "react";
import NotificationsMenu from "./NotificationsMenu";
import NotificationsButton from "./NotificationsButton";
import { useDataProvider } from 'react-admin';
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

const UPDATE_TIME = 1 // Minutes until re-fetch

const NotificationsWidget = (props: NotificationsButtonProps) => {
    const { label } = props;
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const id = open ? 'notifications-popover' : undefined;
    //const [loading, setLoading] = useState(true);

    const dataProvider = useDataProvider();
    const [notifications, setNotifications] = useState([] as INotification[]);

    const fetchNotifications = () => {
        //setLoading(true);
        dataProvider.getList<INotification>('notifications', { filter: { read: false }, pagination: { page: 1, perPage: 5 }, sort: { field: "read", order: "ASC" } })
        .then(({ data }) => {
            setNotifications(data);
        })
        .catch(error => {
            return;
        })
        .finally(() => {
            //setLoading(false);
        })
    }

    const handleMenu = (event: any) => {
        setAnchorEl(event.currentTarget); 
    }
    const handleClose = () => setAnchorEl(null);

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(() => {
            fetchNotifications()
        }, UPDATE_TIME * 60 * 1000) // Minutes * Seconds * Milliseconds
         
        return () => clearInterval(interval);
    }, [])

    const markAllRead = () => {
        dataProvider.update<INotification>('notifications/readall', { id: "", data: {}, previousData: { id: "" } })
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
                fetch={fetchNotifications}
                handleClose={handleClose} 
                data={notifications}
                markAllRead={markAllRead}
            />
        </>
    )
}

export default NotificationsWidget;