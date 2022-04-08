import { makeStyles } from '@material-ui/core';
import React from 'react';
import { BulkDeleteButton, ChipField, Datagrid, DateField, FieldProps, List, ListProps, ReferenceArrayField, ReferenceField, ReferenceInput, SearchInput, SelectInput, SingleFieldList, TextField, TextInput } from 'react-admin';
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
    },
    filter: {
        marginTop: '32px',
        '& .MuiInputBase-root': {
            fontSize: '.8rem'
        },
        '& .MuiFormLabel-root': {
            fontSize: '.9rem',
            transform: 'translate(12px, 12px) scale(1)'
        },
        '& .MuiFormLabel-root.Mui-focused': {
            transform: 'translate(12px, 5px) scale(.7)'
        },
        '& .MuiInputBase-input': {
            paddingTop: '16px'
        }
    },
    select: {
        marginTop: '32px',
        '& .MuiInputBase-root': {
            fontSize: '.8rem'
        },
        '& .MuiFormLabel-root': {
            fontSize: '.9rem',
            transform: 'translate(12px, 12px) scale(1)'
        },
        '& .MuiFormLabel-root.Mui-focused, & .MuiInputLabel-filled.MuiInputLabel-shrink.MuiInputLabel-marginDense': {
            transform: 'translate(12px, 5px) scale(.7)'
        },
        '& .MuiInputBase-input': {
            paddingTop: '16px'
        }
    }
}));

const BulkUserToolbar = (props: any) => (
    <React.Fragment>
        <BulkDeleteButton {...props} />
    </React.Fragment>
)

export interface UserListProps extends FieldProps<IUser>, ListProps {
    
}

const UserList = (props: UserListProps) => {
    const classes = useListStyles();

    const UserListFilters = [
        <SearchInput source="q" alwaysOn />,
        <TextInput source="firstName" className={classes.filter} />,
        <TextInput source="lastName" className={classes.filter} />,
        <ReferenceInput source="rank" reference="ranks" className={classes.select} >
            <SelectInput optionText={choice => `${choice.name}`} />
        </ReferenceInput>
    ];

    return (
        <>
            <List {...props}
                perPage={25}
                bulkActionButtons={<BulkUserToolbar />}
                filters={UserListFilters}
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
                    <TextField source="firstName" label="user.info.first_name" />
                    <TextField source="lastName" label="user.info.last_name" />
                    <DateField source="firstVisited" locales="en-US" options={{ timeZone: 'UTC' }} label="user.info.first_visited" />
                    <DateField source="lastVisited" locales="en-US" options={{ timeZone: 'UTC' }} label="user.info.last_visited" />
                    <ReferenceField source="rank.id" reference="ranks" label="user.info.rank" >
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="username" label="user.info.username" />
                    <TextField source="status" label="user.info.status" />
                    <TextField source="email" label="user.info.email" />
                    <ReferenceArrayField source="teams" reference="teams" label="user.info.teams" >
                        <SingleFieldList linkType="show">
                            <ChipField source="name" />
                        </SingleFieldList>
                    </ReferenceArrayField>
                </Datagrid>
            </List>
        </>
    );
}

export default UserList;
