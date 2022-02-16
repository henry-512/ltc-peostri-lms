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

const useButtonStyles = makeStyles(theme => ({
     root: {
          minWidth: '0px',
          width: '100%',
          padding: '.5rem',
          textAlign: 'center'
     },
     button: {
          minWidth: '0px',
          width: '100%',
          padding: '.5rem',
          textAlign: 'center'
     },
     label: {
          width: 'auto'
     }
}))

const ProjectListGrid = (props: DatagridProps) => {
     const classes = useListStyles();
     const buttonClasses = useButtonStyles();

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
               <DateField source="start" />
               <DateField source="end" />
               <TextField source="status" />
          </Datagrid>
     );
};

export default ProjectListGrid;
