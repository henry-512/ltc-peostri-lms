import { styled } from '@mui/material/styles';
import React from 'react';
import { BulkDeleteButton, ChipField, Datagrid, DateField, FieldProps, List, ListProps, ReferenceArrayField, ReferenceField, ReferenceInput, SearchInput, SelectInput, SingleFieldList, TextField, TextInput } from 'react-admin';
import { AvatarField } from 'src/components/users';
import { dateOptions } from 'src/util/dateFormatter';
import { IUser } from 'src/util/types';

const PREFIX = 'UserList';

const classes = {
    headerRow: `${PREFIX}-headerRow`,
    headerCell: `${PREFIX}-headerCell`,
    rowCell: `${PREFIX}-rowCell`,
    avatar: `${PREFIX}-avatar`,
    filter: `${PREFIX}-filter`,
    select: `${PREFIX}-select`
};

const Root = styled('div')(({ theme }) => ({
    [`& .${classes.avatar}`]: {
        marginRight: theme.spacing(1),
        marginTop: -theme.spacing(0.5),
        marginBottom: -theme.spacing(0.5),
    },

    [`& .${classes.filter}`]: {
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

    [`& .${classes.select}`]: {
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
    const UserListFilters = [
        <SearchInput source="q" alwaysOn />,
        <TextInput source="firstName" className={classes.filter} />,
        <TextInput source="lastName" className={classes.filter} />,
        <ReferenceInput source="rank" reference="admin/ranks" className={classes.select} >
            <SelectInput optionText={choice => `${choice.name}`} />
        </ReferenceInput>
    ];

    return (
        <Root>
            <List {...props}
                perPage={25}
                bulkActionButtons={<BulkUserToolbar />}
                filters={UserListFilters}
            >
                <Datagrid
                    sx={{
                        [`& .RaDatagrid-headerRow`]: {
                            borderLeftColor: 'transparent',
                            borderLeftWidth: 5,
                            borderLeftStyle: 'solid',
                        },
                        [`& .RaDatagrid-headerCell`]: {
                            padding: '6px 8px 6px 8px',
                        },
                        [`& .RaDatagrid-rowCell`]: {
                            padding: '6px 8px 6px 8px',
                        }
                    }}
                    rowClick="edit"
                >
                    {/*<TextField source="id" /> // TODO: Temporarily removing ID due to illegible ID's */}
                    <AvatarField className={classes.avatar} />
                    <TextField source="firstName" label="user.info.first_name" />
                    <TextField source="lastName" label="user.info.last_name" />
                    <DateField source="firstVisited" locales="en-GB" options={dateOptions} label="user.info.first_visited" />
                    <DateField source="lastVisited" locales="en-GB" options={dateOptions} label="user.info.last_visited" />
                    <ReferenceField source="rank.id" reference="admin/ranks" label="user.info.rank" >
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="username" label="user.info.username" />
                    <TextField source="status" label="user.info.status" />
                    <TextField source="email" label="user.info.email" />
                    <ReferenceArrayField source="teams" reference="admin/teams" label="user.info.teams" >
                        <SingleFieldList linkType="show">
                            <ChipField source="name" />
                        </SingleFieldList>
                    </ReferenceArrayField>
                </Datagrid>
            </List>
        </Root>
    );
}

export default UserList;
