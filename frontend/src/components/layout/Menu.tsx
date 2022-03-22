import { useState } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import {
    useTranslate,
    DashboardMenuItem,
    MenuItemLink,
    MenuProps,
    ReduxState,
} from 'react-admin';

import SubMenu from './SubMenu';
import { AppState } from 'src/util/types';
import SettingsIcon from '@material-ui/icons/Settings';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import { ProjectIcon } from '../../pages/project';
import { ProjectTemplateIcon } from '../../pages/template/projects';
import { ModuleTemplateIcon } from '../../pages/template/modules';
import { UserIcon } from '../../pages/user';
import { PermissionIcon } from 'src/pages/permission';

type MenuName = 'menuAdmin' | 'menuTemplate';

const Menu = ({ dense = false }: MenuProps) => {
    const [state, setState] = useState({
        menuAdmin: true,
        menuTemplate: true
    });
    const translate = useTranslate();
    const open = useSelector((state: ReduxState) => state.admin.ui.sidebarOpen);
    useSelector((state: AppState) => state.theme); // force rerender on theme change
    const classes = useStyles();

    const handleToggle = (menu: MenuName) => {
        setState(state => ({ ...state, [menu]: !state[menu] }));
    };

    return (
        <div
            className={classnames(classes.root, {
                [classes.open]: open,
                [classes.closed]: !open,
            })}
        >
            {' '}
            <DashboardMenuItem />
            <SubMenu
                handleToggle={() => handleToggle('menuAdmin')}
                isOpen={state.menuAdmin}
                name="layout.menu.administration"
                icon={<SettingsIcon />}
                dense={dense}
            >
                <MenuItemLink
                    to={{
                        pathname: '/projects',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.projects")}
                    leftIcon={<ProjectIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/users',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.users")}
                    leftIcon={<UserIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/ranks',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.permissions")}
                    leftIcon={<PermissionIcon />}
                />
            </SubMenu>
            <SubMenu
                handleToggle={() => handleToggle('menuTemplate')}
                isOpen={state.menuTemplate}
                name="layout.menu.templates"
                icon={<FileCopyIcon />}
                dense={dense}
            >
                <MenuItemLink
                    to={{
                        pathname: '/template/modules',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.modules")}
                    leftIcon={<ModuleTemplateIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/template/projects',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.projects")}
                    leftIcon={<ProjectTemplateIcon />}
                />
            </SubMenu>
        </div>
    );
};

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    open: {
        width: 200
    },
    closed: {
        width: 55,
    },
}));

export default Menu;
