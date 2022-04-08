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

    useEffect(() => {
        dataProvider.getList<INotification>('users/notifications/list', { filter: { read: true }, pagination: { page: 1, perPage: 5 }, sort: { field: "createdAt", order: "ASC"} })
        .then(({ data }) => {
            setNotifications(data);
            setLoading(false);
        })
        .catch(error => {
            return;
        })
    }, [])

    return (
        <>
            <NotificationsButton id={id} label={label} handleMenu={handleMenu} />
            <NotificationsMenu 
                id={id}
                anchorEl={anchorEl} 
                AnchorOrigin={AnchorOrigin} 
                TransformOrigin={TransformOrigin} 
                open={open} 
                handleClose={handleClose} 
                data={notifications}
                loading={loading}
            />
        </>
    )
}

export default NotificationsWidget;