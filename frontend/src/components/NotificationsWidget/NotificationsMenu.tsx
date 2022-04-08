import { Box, Divider, Link, Menu, Popover, PopoverOrigin, Typography } from "@material-ui/core"
import React from "react"
import { INotification } from "src/util/types"
import NotificationsEmpty from "./NotificationsEmpty"
import NotificationsItem from "./NotificationsItem"

export type NotificationsMenuProps = {
    anchorEl: Element | null
    AnchorOrigin: PopoverOrigin
    TransformOrigin: PopoverOrigin
    open: boolean
    handleClose: any
    data?: INotification[]
    id?: string
}

const Header = ({disabled}: {disabled: boolean}) => {
    
    return (    
        <>
            <Box display="flex" padding=".5rem 1rem" alignItems="center" >
                <Typography variant="subtitle1">
                    Notifications
                </Typography>
                <Box sx={{ flex: '1 1 auto' }} />
                {(disabled) ? null :
                    <Link href="#some-link">
                        Mark all as read
                    </Link>
                }
            </Box>
            <Divider />
        </>
    )
}

const Footer = ({disabled}: {disabled: boolean}) => {

    return (
        <>
            {(disabled) ? null : (
                <>
                    <Divider />
                    <Box display="flex" padding="1rem 1rem" justifyContent="center">
                        <Link href="#some-link">
                            See All Notifications
                        </Link>
                    </Box>
                </>
            )}
        </>
    )
}

const NotificationsMenu = (props: NotificationsMenuProps) => {
    const { anchorEl, AnchorOrigin, TransformOrigin, open, handleClose, data = [], id } = props;

    return (
        <>
            <Popover
                id={id}
                anchorEl={anchorEl}
                anchorOrigin={AnchorOrigin}
                transformOrigin={TransformOrigin}
                // Make sure the menu is display under the button and not over the appbar
                // See https://v4.mui.com/components/menus/#customized-menus
                getContentAnchorEl={null}
                open={open}
                onClose={handleClose}
            >
                <Header disabled={(data && data.length > 0) ? false : true} />
                {(data && data.length > 0) ? 
                    data.map((notification, index) => {
                        return React.cloneElement(<NotificationsItem record={notification} />, {
                            key: index
                        });
                    })
                : (
                    <NotificationsEmpty />
                )}
                <Footer disabled={(data && data.length > 0) ? false : true} />
            </Popover>
        </>
    )
}

export default NotificationsMenu;