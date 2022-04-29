/**
* @file Main notifications widget to display on the App Bar.
* @module NotificationsWidget
* @category NotificationsWidget
* @author Braden Cariaga
*/

import { PopoverOrigin } from "@mui/material";
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

const UPDATE_TIME = 10 // Minutes until re-fetch

const NotificationsWidget = (props: NotificationsButtonProps) => {
    const { label } = props;
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);

    const id = open ? 'notifications-popover' : undefined;

    const dataProvider = useDataProvider();
    const [notifications, setNotifications] = useState([] as INotification[]);

    /**
     * I want to fetch notifications from the API, and then set the notifications state to the data I
     * get back from the API.
     */
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

    /* It's a React hook that runs the function `fetchNotifications` every `UPDATE_TIME` minutes. */
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(() => {
            fetchNotifications()
        }, UPDATE_TIME * 60 * 1000) // Minutes * Seconds * Milliseconds
         
        return () => clearInterval(interval);
    }, [])

    /**
     * I'm trying to call a function that returns a promise, but I don't care about the result of the
     * promise, I just want to call the function.
     * @param {Event} e - Event - the event that triggered the function
     */
    const markAllRead = (e: Event) => {
        e.preventDefault();

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
            <NotificationsButton id={id} label={label} handleMenu={handleMenu} hasNew={(notifications && notifications.length > 0)} count={(notifications?.length)} />
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