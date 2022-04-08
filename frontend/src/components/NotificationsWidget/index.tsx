import { PopoverOrigin } from "@material-ui/core";
import { useState } from "react";
import NotificationsMenu from "./NotificationsMenu";
import NotificationsButton from "./NotificationsButton";

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
            />
        </>
    )
}

export default NotificationsWidget;