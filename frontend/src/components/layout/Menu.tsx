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
import { ProjectIcon } from '../project';
import { TemplateIcon } from '../template';

type MenuName = 'menuAdmin';

const Menu = ({ dense = false }: MenuProps) => {
     const [state, setState] = useState({
          menuAdmin: true,
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
                              pathname: '/templates',
                              state: { _scrollToTop: true },
                         }}
                         primaryText={translate("layout.menu.templates")}
                         leftIcon={<TemplateIcon />}
                    />
               </SubMenu>
               <MenuItemLink
                    to={{
                         pathname: '/reviews',
                         state: { _scrollToTop: true },
                    }}
                    primaryText="Item"
                    dense={dense}
               />
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
          width: 200,
     },
     closed: {
          width: 55,
     },
}));

export default Menu;
