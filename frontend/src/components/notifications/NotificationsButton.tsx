import { IconButton, makeStyles, Tooltip } from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';
import { MouseEventHandler, useState } from "react";
import { useTranslate } from 'react-admin'

const useStyles = makeStyles(theme => ({
    root: {
        minWidth: '0'
    }
}));

export type NotificationsButtonProps = {
    label: string
}

const NotificationsButton = (props: NotificationsButtonProps) => {
    const { label } = props;
    const classes = useStyles();
    const translate = useTranslate();
    const [anchorEl, setAnchorEl] = useState(null);

    const open = Boolean(anchorEl);
    
    const handleMenu = (event: any) => setAnchorEl(event.currentTarget);
    const handleClose = () => setAnchorEl(null);

    return (
        <>
            <Tooltip title={label && translate(label, { _: label })}>
                <IconButton
                    color="inherit"
                    onClick={handleMenu}
                >
                    <NotificationsIcon />
                </IconButton>
            </Tooltip>
        </>
    )
}

export default NotificationsButton;