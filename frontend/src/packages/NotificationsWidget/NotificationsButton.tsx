import { IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslate } from "react-admin";

export type NotificationsButtonProps = {
    label: string
    handleMenu: any
    id?: string
    hasNew: boolean
}

const NotificationsButton = (props: NotificationsButtonProps) => {
    const { label, handleMenu, id, hasNew } = props;
    const translate = useTranslate();

    return <>
        <Tooltip title={label && translate(label, { _: label })}>
            <IconButton color="inherit" onClick={handleMenu} aria-describedby={id} size="large">
                {(hasNew === true) ? <NotificationsActiveIcon /> : <NotificationsIcon />}
            </IconButton>
        </Tooltip>
    </>;
}

export default NotificationsButton;