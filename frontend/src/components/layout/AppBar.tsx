import { AppBar, UserMenu, Loading, Error, useQuery } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

import Logo from './Logo';
import NotificationsWidget from '../NotificationsWidget';

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

    const { data, loading, error } = useQuery({ 
        type: 'getList',
        resource: 'users/notifications/list',
        payload: { status }
    });

    if (loading) return <Loading />;
    if (error) return <Error error={error} />;
    if (!data) return null;
    
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
