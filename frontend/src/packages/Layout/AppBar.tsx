import { AppBar, UserMenu } from 'react-admin';
import { styled } from '@mui/material/styles';
import { Typography } from '@mui/material';

import NotificationsWidget from '../NotificationsWidget';
import { Logo } from 'src/components/misc';

const CustomAppBar = (props: any) => {
    
    return (
        <AppBar {...props} elevation={1} userMenu={<UserMenu />}>
            <Typography
                variant="h6"
                color="inherit"
                id="react-admin-title"
                sx={{
                    flex: 1,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                }}
            />
            <Logo sx={{
                position: 'absolute',
                left: '50%',
                transform: 'translateX(-50%)'
            }}/>
            <NotificationsWidget label="layout.appbar.notifications" />
        </AppBar>
    );
};

export default CustomAppBar;
