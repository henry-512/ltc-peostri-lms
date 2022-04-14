import { AppBar, UserMenu } from 'react-admin';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

import NotificationsWidget from '../NotificationsWidget';
import { Logo } from 'src/components/misc';

const PREFIX = 'CustomAppBar';

const classes = {
    title: `${PREFIX}-title`,
    spacer: `${PREFIX}-spacer`
};

const StyledAppBar = styled(AppBar)({
    [`& .${classes.title}`]: {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    [`& .${classes.spacer}`]: {
        flex: 1,
    },
});

const CustomAppBar = (props: any) => {

    
    return (
        <StyledAppBar {...props} elevation={1} userMenu={<UserMenu />}>
            <Typography
                variant="h6"
                color="inherit"
                className={classes.title}
                id="react-admin-title"
            />
            <Logo />
            <span className={classes.spacer} />
            <NotificationsWidget label="layout.appbar.notifications" />
        </StyledAppBar>
    );
};

export default CustomAppBar;
