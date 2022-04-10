import { makeStyles } from '@material-ui/core';
import { Datagrid, DateField, List, ListProps, TextField } from 'react-admin';
import { ProjectEmptyList, ProjectListActions } from 'src/components/project';
import rowStyle from './rowStyle';
import { dateOptions } from 'src/util/dateFormatter';

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

const AdminProjectList = (props: ListProps) => {
    const classes = useListStyles();

     return (
          <>
               <List {...props}
                    perPage={25}
                    empty={<ProjectEmptyList />}
                    actions={<ProjectListActions />}
               >
                    <Datagrid
                        classes={{
                                headerRow: classes.headerRow,
                                headerCell: classes.headerCell,
                                rowCell: classes.rowCell,
                        }}
                        // @ts-ignore
                        rowStyle={rowStyle}
                        rowClick="edit"
                    >
                        {/*<TextField source="id" /> // TODO: Temporarily removing ID due to illegible ID's */}
                        <TextField source="title" />
                        <DateField source="createdAt" locales="en-US" showTime options={dateOptions} />
                        <DateField source="updatedAt" locales="en-US" showTime options={dateOptions} />
                        <DateField source="start" locales="en-US" />
                        <DateField source="suspense" locales="en-US" />
                        <TextField source="status" />
                    </Datagrid>
               </List>
          </>
     );
}

export default AdminProjectList;
