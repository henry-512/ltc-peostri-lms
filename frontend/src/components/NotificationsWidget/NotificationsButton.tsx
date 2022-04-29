import { Badge, IconButton, Tooltip } from "@mui/material";
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslate } from "react-admin";

export type NotificationsButtonProps = {
    label: string
    handleMenu: any
    id?: string
    hasNew: boolean
    count?: number
}

const NotificationsButton = (props: NotificationsButtonProps) => {
    const { label, handleMenu, id, hasNew } = props;
    const translate = useTranslate();

    return <>
        <Tooltip title={label && translate(label, { _: label })}>
            <IconButton color="inherit" onClick={handleMenu} aria-describedby={id} size="large">
                <Badge variant="dot" color="primary" invisible={!hasNew}>
                    {(hasNew === true) ? <NotificationsActiveIcon /> : <NotificationsIcon />}
                </Badge>
            </IconButton>
        </Tooltip>
    </>;
}

export default NotificationsButton;