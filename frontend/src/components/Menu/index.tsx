import { useState } from 'react';
import { styled } from '@mui/material/styles';
import classnames from 'classnames';
import {
    useTranslate,
    DashboardMenuItem,
    MenuItemLink,
    MenuProps,
    useSidebarState,
} from 'react-admin';

import SubMenu from './SubMenu';
import SettingsIcon from '@mui/icons-material/Settings';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { AdminProjectIcon } from '../../pages/administration/project';
import { ProjectTemplateIcon } from '../../pages/template/projects';
import { ModuleTemplateIcon } from '../../pages/template/modules';
import { UserIcon } from '../../pages/administration/users';
import { TeamIcon } from '../../pages/administration/teams';
import { AdminFilesIcon } from '../../pages/administration/files';
import PermissionIcon from '@mui/icons-material/Security';

const PREFIX = 'Menu';

const classes = {
    root: `${PREFIX}-root`,
    open: `${PREFIX}-open`,
    closed: `${PREFIX}-closed`
};

const Root = styled('div')(({ theme }) => ({
    [`&.${classes.root}`]: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },

    [`&.${classes.open}`]: {
        width: 220
    },

    [`&.${classes.closed}`]: {
        width: 55,
    }
}));

export type MenuName = 'menuAdmin' | 'menuTemplate';

const Menu = ({ dense = false }: MenuProps) => {
    const [state, setState] = useState({
        menuAdmin: true,
        menuTemplate: true
    });
    const translate = useTranslate();
    const [open] = useSidebarState();


    const handleToggle = (menu: MenuName) => {
        setState(state => ({ ...state, [menu]: !state[menu] }));
    };

    return (
        <Root
            className={classnames(classes.root, {
                [classes.open]: open,
                [classes.closed]: !open,
            })}
        >
            <DashboardMenuItem />
            <MenuItemLink
                to={{
                    pathname: '/projects'
                }}
                replace={true}
                primaryText={translate("layout.menu.my_projects")}
                leftIcon={<AdminProjectIcon />}
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
                        pathname: '/admin/projects'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.projects")}
                    leftIcon={<AdminProjectIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/admin/users'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.users")}
                    leftIcon={<UserIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/admin/ranks'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.ranks")}
                    leftIcon={<PermissionIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/admin/teams'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.teams")}
                    leftIcon={<TeamIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/admin/files'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.files")}
                    leftIcon={<AdminFilesIcon />}
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
                        pathname: '/admin/template/projects'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.project_templates")}
                    leftIcon={<ProjectTemplateIcon />}
                />
                <MenuItemLink
                    to={{
                        pathname: '/admin/template/modules'
                    }}
                    replace={true}
                    primaryText={translate("layout.menu.module_templates")}
                    leftIcon={<ModuleTemplateIcon />}
                />
            </SubMenu>
        </Root>
    );
};

export default Menu;
