/**
* @file Dashboard Notifications Widget List Item
* @module MyNotificationsListItem
* @category Dashboard
* @author Braden Cariaga
*/

import { Box, styled, Typography } from "@mui/material";
import classnames from "classnames";
import NotificationIcon from "src/components/NotificationIcon";
import { dateFormatToString } from "src/util/dateFormatter";
import { INotification } from "src/util/types";

const PREFIX = 'NotificationsItem';

const classes = {
    root: `${PREFIX}-root`,
    read: `${PREFIX}-read`,
    iconWrapper: `${PREFIX}-iconWrapper`,
    infoWrapper: `${PREFIX}-infoWrapper`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.root}`]: {
        display: "flex",
        alignItems: "center",
        gap: '10px',
        color: theme.palette.primary.main
    },

    [`& .${classes.read}`]: {
        color: "#808080"
    },

    [`& .${classes.iconWrapper}`]: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: 'transparent'
    },

    [`& .${classes.infoWrapper}`]: {
        display: "flex",
        flexDirection: "column",
        backgroundColor: 'transparent',
        color: 'rgba(0, 0, 0, 0.87)',
    }
}));


export type NotificationListItemProps = {
    record: INotification
}

const NotificationListItem = ({ record }: NotificationListItemProps) => (
    <Root>
        <Box className={classnames(classes.root, {
            [classes.read]: record.read
        })}>
            <Box className={classes.iconWrapper} >
                <NotificationIcon type={record.type} size="medium" />
            </Box>
            <Box className={classes.infoWrapper}>
                <Typography variant="body2">
                    {record.content}
                </Typography>
                <Typography variant="caption">
                    {dateFormatToString(record.createdAt, true)}
                </Typography>
            </Box>
        </Box>
    </Root>
)

export default NotificationListItem;