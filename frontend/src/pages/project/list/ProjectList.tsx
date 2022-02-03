import { Drawer, makeStyles } from '@material-ui/core';
import classnames from 'classnames';
import React, { useCallback } from 'react';
import { List, Datagrid, TextField, EditButton, DeleteButton, ListProps } from 'react-admin';
import { Route, RouteChildrenProps, useHistory } from 'react-router';
import ProjectEdit from '../edit';
import ProjectListGrid from './ProjectListGrid';

const ProjectList = (props: ListProps) => {
     const history = useHistory();
     const handleClose = useCallback(() => {
          history.push('/projects');
     }, [history]);

     return (
          <div>
               <List {...props}
                    perPage={25}
               >
                    <ProjectListGrid />
               </List>
          </div>
     );
}

export default ProjectList;
