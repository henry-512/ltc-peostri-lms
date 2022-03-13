import { makeStyles } from '@material-ui/core';
import { Datagrid, DateField, List, ListProps, TextField } from 'react-admin';

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

const ProjectList = (props: ListProps) => {
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
                        <TextField source="title" />
                        <DateField source="createdAt" showTime />
                        <DateField source="updatedAt" showTime />
                        <DateField source="start" locales="en-US" options={{ timeZone: 'UTC' }} />
                        <DateField source="end" locales="en-US" options={{ timeZone: 'UTC' }} />
                        <TextField source="status" />
                    </Datagrid>
               </List>
          </>
     );
}

export default ProjectList;
