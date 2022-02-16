import {
     Datagrid,
     DateField,
     TextField,
     DatagridProps,
     EditButton,
     DeleteButton,
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
               {...props}
          >
               <TextField source="id" />
               <TextField source="title" />
               <DateField source="createdAt" showTime />
               <DateField source="updatedAt" showTime />
               <DateField source="start" />
               <DateField source="end" />
               <TextField source="status" />
               <EditButton basePath='/' label="" />
               <DeleteButton basePath='/' label="" />
          </Datagrid>
     );
};

export default ProjectListGrid;
