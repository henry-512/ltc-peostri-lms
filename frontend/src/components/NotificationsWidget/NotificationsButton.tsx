import { IconButton, Tooltip } from "@material-ui/core";
import NotificationsIcon from '@material-ui/icons/Notifications';
import { useTranslate } from "react-admin";

export type NotificationsButtonProps = {
    label: string
    handleMenu: any
    id?: string
}

const NotificationsButton = (props: NotificationsButtonProps) => {
    const { label, handleMenu, id } = props;
    const translate = useTranslate();

    return (
        <>
            <Tooltip title={label && translate(label, { _: label })}>
                <IconButton
                    color="inherit"
                    onClick={handleMenu}
                    aria-describedby={id}
                >
                    <NotificationsIcon />
                </IconButton>
            </Tooltip>
        </>
    )
}

export default NotificationsButton;