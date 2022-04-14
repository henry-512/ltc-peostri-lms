import { Box, Icon, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import { useTranslate } from "react-admin";

const PREFIX = 'NotificationsEmpty';

const classes = {
    fontSizeLarge: `${PREFIX}-fontSizeLarge`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')(({ theme }) => ({
    [`& .${classes.fontSizeLarge}`]: {
        fontSize: '48px'
    }
}));

export type NotificationsEmptyProps = {
}

const NotificationsEmpty = (props: NotificationsEmptyProps) => {

    const translate = useTranslate();

    return (
        <Root>
            <Box minWidth='calc(300px - 2rem)' display="flex" justifyContent="center" alignItems="center" padding="1rem 1rem" flexDirection="column" >
                <NotificationsOffIcon fontSize="large" color='primary' classes={classes} />
                <Typography variant="subtitle1" >
                    {translate('notification.empty')}
                </Typography>
            </Box>
        </Root>
    );
}

export default NotificationsEmpty;