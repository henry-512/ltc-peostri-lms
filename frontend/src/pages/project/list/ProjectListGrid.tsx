import {
     Datagrid,
     DateField,
     TextField,
     DatagridProps,
} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

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

const ProjectListGrid = (props: DatagridProps) => {
     const classes = useListStyles();

     return (
          <Datagrid
               classes={{
                    headerRow: classes.headerRow,
                    headerCell: classes.headerCell,
                    rowCell: classes.rowCell,
               }}
               rowClick="edit"
               {...props}
          >
               <TextField source="id" />
               <TextField source="title" />
               <DateField source="createdAt" showTime />
               <DateField source="updatedAt" showTime />
               <DateField source="start" locales="en-US" options={{ timeZone: 'UTC' }} />
               <DateField source="end" locales="en-US" options={{ timeZone: 'UTC' }} />
               <TextField source="status" />
          </Datagrid>
     );
};

export default ProjectListGrid;
