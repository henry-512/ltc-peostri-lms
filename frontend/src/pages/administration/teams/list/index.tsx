import { makeStyles } from '@material-ui/core';
import { Datagrid, FieldProps, List, ListProps, ReferenceArrayField, SingleFieldList, TextField } from 'react-admin';
import { UserChip } from 'src/components/misc';
import { ITeam } from 'src/util/types';

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

export interface TeamListProps extends FieldProps<ITeam>, ListProps {
    
}

const TeamList = (props: TeamListProps) => {
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
                    <TextField source="name" label="team.info.name" />
                    <ReferenceArrayField source="users" reference="admin/users" label="team.info.users" >
                        <SingleFieldList linkType="show">
                            <UserChip />
                        </SingleFieldList>
                    </ReferenceArrayField>
                </Datagrid>
            </List>
        </>
    );
}

export default TeamList;
