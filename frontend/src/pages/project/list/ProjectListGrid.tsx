import {
     Identifier,
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
               rowClick="edit"
               classes={{
                    headerRow: classes.headerRow,
                    headerCell: classes.headerCell,
                    rowCell: classes.rowCell,
               }}
               optimized
               {...props}
          >
               <TextField source="id" />
               <TextField source="title" />
               <TextField source="createdAt" />
               <EditButton basePath='/projects' />
               <DeleteButton basePath='/projects' />
          </Datagrid>
     );
};

export default ProjectListGrid;
