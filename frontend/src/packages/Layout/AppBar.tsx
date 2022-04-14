import { AppBar, UserMenu } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import NotificationsWidget from '../NotificationsWidget';
import { Logo } from 'src/components/misc';

const useStyles = makeStyles({
    title: {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    spacer: {
        flex: 1,
    },
});

const CustomAppBar = (props: any) => {
    const classes = useStyles();
    
    return (
        <AppBar {...props} elevation={1} userMenu={<UserMenu />}>
            <Typography
                variant="h6"
                color="inherit"
                className={classes.title}
                id="react-admin-title"
            />
            <Logo />
            <span className={classes.spacer} />
            <NotificationsWidget label="layout.appbar.notifications" />
        </AppBar>
    );
};

export default CustomAppBar;
