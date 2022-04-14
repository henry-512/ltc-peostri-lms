import { styled } from '@mui/material/styles';
import { Datagrid, FieldProps, List, ListProps, ReferenceArrayField, SingleFieldList, TextField } from 'react-admin';
import { UserChip } from 'src/components/misc';
import { ITeam } from 'src/util/types';

const PREFIX = 'TeamList';

const classes = {
    headerRow: `${PREFIX}-headerRow`,
    headerCell: `${PREFIX}-headerCell`,
    rowCell: `${PREFIX}-rowCell`,
    avatar: `${PREFIX}-avatar`,
    filter: `${PREFIX}-filter`,
    select: `${PREFIX}-select`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')((
    {
        theme
    }
) => ({
    [`& .${classes.headerRow}`]: {
        borderLeftColor: 'transparent',
        borderLeftWidth: 5,
        borderLeftStyle: 'solid',
    },

    [`& .${classes.headerCell}`]: {
        padding: '6px 8px 6px 8px',
    },

    [`& .${classes.rowCell}`]: {
        padding: '6px 8px 6px 8px',
    },

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

const useListStyles = makeStyles((
    {
        theme
    }
) => ({
    [`& .${classes.headerRow}`]: {
        borderLeftColor: 'transparent',
        borderLeftWidth: 5,
        borderLeftStyle: 'solid',
    },

    [`& .${classes.headerCell}`]: {
        padding: '6px 8px 6px 8px',
    },

    [`& .${classes.rowCell}`]: {
        padding: '6px 8px 6px 8px',
    },

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

export interface TeamListProps extends FieldProps<ITeam>, ListProps {
    
}

const TeamList = (props: TeamListProps) => {
    const classes = useListStyles();

    return (
        (<Root>
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
        </Root>)
    );
}

export default TeamList;
