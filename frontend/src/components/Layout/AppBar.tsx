/**
* @file Customized header bar.
* @module CustomAppBar
* @category Layout
* @author Braden Cariaga
*/

import { AppBar, AppBarProps, UserMenu } from 'react-admin';
import { Typography } from '@mui/material';

import NotificationsWidget from '../NotificationsWidget';
import Logo from 'src/components/Logo';

/**
 * Customized header bar.
 * @param {AppBarProps} props - AppBarProps
 */
const CustomAppBar = (props: AppBarProps) => {
    
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
