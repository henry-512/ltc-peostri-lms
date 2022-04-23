import { Box, Divider, Link, Button, Popover, PopoverOrigin, Typography } from "@mui/material";
import React from "react"
import { Loading, useTranslate } from "react-admin"
import { useNavigate } from "react-router"
import { INotification } from "src/util/types"
import NotificationsEmpty from "./NotificationsEmpty"
import NotificationsItem from "./NotificationsItem"

const Header = ({disabled, markAllRead}: {disabled: boolean, markAllRead: any}) => {
    const translate = useTranslate();

    return (
        <>
            <Box display="flex" padding=".5rem 1rem" alignItems="center" >
                <Typography variant="subtitle1">
                {translate('notification.title')}
                </Typography>
                <Box sx={{ flex: '1 1 auto' }} />
                {(disabled) ? null :
                    <Link href="#" onClick={markAllRead} >
                        {translate('notification.mark_all_read')}
                    </Link>
                }
            </Box>
            <Divider />
        </>
    );
}

const Footer = ({disabled, handleClose}: {disabled?: boolean, handleClose: Function}) => {
    const navigate = useNavigate();
    const translate = useTranslate();

    const viewAllNotifications = (e: any) => {
        navigate('/notifications', { replace: true });
        handleClose();
    }

    return (
        <>
            {(disabled) ? null : (
                <>
                    <Divider />
                    <Box display="flex" padding="0" justifyContent="center">
                        <Button onClick={viewAllNotifications} disableElevation size="small" fullWidth sx={{
                            borderRadius: '0 0 10px 10px',
                            padding: '.5rem 0'
                        }}>
                            {translate('notification.see_all')}
                        </Button>
                    </Box>
                </>
            )}
        </>
    )
}

export type NotificationsMenuProps = {
    anchorEl: Element | null
    AnchorOrigin: PopoverOrigin
    TransformOrigin: PopoverOrigin
    open: boolean
    handleClose: any
    data?: INotification[]
    id?: string
    loading?: boolean
    markAllRead: Function
    fetch: Function
}

const NotificationsMenu = (props: NotificationsMenuProps) => {
    const { anchorEl, AnchorOrigin, TransformOrigin, open, handleClose, data = [], id, loading = false, markAllRead, fetch } = props;

    return (
        <>
            <Popover
                id={id}
                anchorEl={anchorEl}
                anchorOrigin={AnchorOrigin}
                transformOrigin={TransformOrigin}
                open={open}
                onClose={handleClose}
                sx={{
                    paper: {
                        minWidth: '300px'
                    }
                }}
            >
                <Header disabled={(data && data.length > 0) ? false : true} markAllRead={markAllRead} />
                {(loading) ? <Loading loadingPrimary="" loadingSecondary="Loading Notifications.." /> :
                    (data && data.length > 0) ? 
                        data.map((notification, index) => {
                            return React.cloneElement(<NotificationsItem record={notification} last={data.length - 1 == index} fetch={fetch} handleClose={handleClose} />, {
                                key: index
                            });
                        })
                    : (
                        <NotificationsEmpty />
                    )
                }
                <Footer handleClose={handleClose} />
            </Popover>
        </>
    )
}

export default NotificationsMenu;