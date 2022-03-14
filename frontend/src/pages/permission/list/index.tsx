import { makeStyles } from '@material-ui/core';
import React from 'react';
import { BulkDeleteButton, Datagrid, FieldProps, List, ListProps, ReferenceField, TextField } from 'react-admin';
import { AvatarField } from 'src/components/users';
import { IUser } from 'src/util/types';

const useListStyles = makeStyles(theme => ({
    headerRow: {
        borderLeftColor: 'transparent',
        borderLeftWidth: 5,
        borderLeftStyle: 'solid',
    },
    headerCell: {
        padding: '6px 8px 6px 8px',
    },
    rowCell: {
        padding: '6px 8px 6px 8px',
    },
    avatar: {
        marginRight: theme.spacing(1),
        marginTop: -theme.spacing(0.5),
        marginBottom: -theme.spacing(0.5),
    }
}));

const BulkUserToolbar = (props: any) => (
    <React.Fragment>
        <BulkDeleteButton {...props} />
    </React.Fragment>
)

interface UserListProps extends FieldProps<IUser>, ListProps {
    
}

const UserList = (props: UserListProps) => {
    const classes = useListStyles();
    return (
        <>
            <List {...props}
                perPage={25}
                bulkActionButtons={<BulkUserToolbar />}
            >
                <Datagrid
                    classes={{
                        headerRow: classes.headerRow,
                        headerCell: classes.headerCell,
                        rowCell: classes.rowCell,
                    }}
                    rowClick="edit"
                >
                    {/*<TextField source="id" /> // TODO: Temporarily removing ID due to illegible ID's */}
                    <AvatarField className={classes.avatar} />
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="username" />
                    <ReferenceField source="rank.id" reference="ranks">
                        <TextField source="name" />
                    </ReferenceField>
                </Datagrid>
            </List>
        </>
    );
}

export default UserList;
