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
import { ProjectIcon } from '../../pages/administration/project';
import { ProjectTemplateIcon } from '../../pages/template/projects';
import { ModuleTemplateIcon } from '../../pages/template/modules';
import { UserIcon } from '../../pages/administration/user';
import PermissionIcon from '@material-ui/icons/Security';

export type MenuName = 'menuAdmin' | 'menuTemplate';

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
            <DashboardMenuItem />
            <MenuItemLink
                to={{
                    pathname: '/users/tasks/list',
                    state: { _scrollToTop: true },
                }}
                primaryText={translate("layout.menu.my_tasks")}
                leftIcon={<ProjectIcon />}
            />
            <MenuItemLink
                to={{
                    pathname: '/users/projects/list',
                    state: { _scrollToTop: true },
                }}
                primaryText={translate("layout.menu.my_projects")}
                leftIcon={<ProjectIcon />}
            />
            <SubMenu
                handleToggle={() => handleToggle('menuAdmin')}
                isOpen={state.menuAdmin}
                name="layout.menu.administration"
                icon={<SettingsIcon />}
                dense={dense}
            >
                <MenuItemLink
                    to={{
                        pathname: '/projects/list',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.projects")}
                    leftIcon={<ProjectIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/users/list',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.users")}
                    leftIcon={<UserIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/ranks/list',
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
                        pathname: '/template/projects/list',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.project_templates")}
                    leftIcon={<ProjectTemplateIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/template/modules/list',
                        state: { _scrollToTop: true },
                    }}
                    primaryText={translate("layout.menu.module_templates")}
                    leftIcon={<ModuleTemplateIcon />}
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
        width: 220
    },
    closed: {
        width: 55,
    },
}));

export default Menu;
