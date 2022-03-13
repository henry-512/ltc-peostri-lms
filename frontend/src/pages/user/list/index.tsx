import { makeStyles } from '@material-ui/core';
import { Datagrid, List, ListProps, TextField } from 'react-admin';

const useListStyles = makeStyles({
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
    comment: {
        maxWidth: '18em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
});

const UserList = (props: ListProps) => {
    const classes = useListStyles();

    return (
        <>
            <List {...props}
                perPage={25}
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
                    <TextField source="firstName" />
                    <TextField source="lastName" />
                    <TextField source="username" />
                    <TextField source="avatar" />
                </Datagrid>
            </List>
        </>
    );
}

export default UserList;
