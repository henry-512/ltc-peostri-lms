import { Box, Divider, Link, Button, Popover, PopoverOrigin, Typography, makeStyles } from "@material-ui/core"
import React from "react"
import { Loading } from "react-admin"
import { useHistory } from "react-router-dom"
import { INotification } from "src/util/types"
import NotificationsEmpty from "./NotificationsEmpty"
import NotificationsItem from "./NotificationsItem"

const Header = ({disabled, markAllRead}: {disabled: boolean, markAllRead: any}) => {

    return (    
        <>
            <Box display="flex" padding=".5rem 1rem" alignItems="center" >
                <Typography variant="subtitle1">
                    Notifications
                </Typography>
                <Box sx={{ flex: '1 1 auto' }} />
                {(disabled) ? null :
                    <Link href="#" onClick={markAllRead} >
                        Mark all as read
                    </Link>
                }
            </Box>
            <Divider />
        </>
    )
}

const useFooterStyles = makeStyles(theme => ({
    root: {
        borderRadius: '0 0 10px 10px',
        padding: '.5rem 0'
    }
}))

const Footer = ({disabled, handleClose}: {disabled?: boolean, handleClose: Function}) => {
    const classes = useFooterStyles();
    const history = useHistory();

    const viewAllNotifications = (e: any) => {
        history.push('/user/notifications');
        handleClose();
    }

    return (
        <>
            {(disabled) ? null : (
                <>
                    <Divider />
                    <Box display="flex" padding="0" justifyContent="center">
                        <Button onClick={viewAllNotifications} disableElevation size="small" fullWidth classes={classes}>
                            See All Notifications
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
    loading: boolean
    markAllRead: Function
}

const useStyles = makeStyles(theme => ({
    loader: {
        padding: '4rem 1rem 1rem 1rem',
        height: 'auto'
    },
    paper: {
        minWidth: '300px'
    }
}));

const NotificationsMenu = (props: NotificationsMenuProps) => {
    const { anchorEl, AnchorOrigin, TransformOrigin, open, handleClose, data = [], id, loading, markAllRead } = props;
    const classes = useStyles();

    return (
        <>
            <Popover
                id={id}
                anchorEl={anchorEl}
                anchorOrigin={AnchorOrigin}
                transformOrigin={TransformOrigin}
                getContentAnchorEl={null}
                open={open}
                onClose={handleClose}
                classes={classes}
            >
                <Header disabled={(data && data.length > 0) ? false : true} markAllRead={markAllRead} />
                {(loading) ? <Loading className={classes.loader} loadingPrimary="" loadingSecondary="Loading Notifications.." /> :
                    (data && data.length > 0) ? 
                        data.map((notification, index) => {
                            return React.cloneElement(<NotificationsItem record={notification} last={data.length - 1 == index} />, {
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