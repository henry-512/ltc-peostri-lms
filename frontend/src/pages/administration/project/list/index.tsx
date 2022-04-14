import { styled } from '@mui/material/styles';
import { Datagrid, DateField, List, ListProps, TextField } from 'react-admin';
import { ProjectEmptyList, ProjectListActions } from 'src/components/project';
import rowStyle from './rowStyle';
import { dateOptions } from 'src/util/dateFormatter';

const PREFIX = 'AdminProjectList';

const classes = {
     headerRow: `${PREFIX}-headerRow`,
     headerCell: `${PREFIX}-headerCell`,
     rowCell: `${PREFIX}-rowCell`,
     comment: `${PREFIX}-comment`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
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
    [`& .${classes.comment}`]: {
         maxWidth: '18em',
         overflow: 'hidden',
         textOverflow: 'ellipsis',
         whiteSpace: 'nowrap',
    },
});

const useListStyles = makeStyles({
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
    [`& .${classes.comment}`]: {
         maxWidth: '18em',
         overflow: 'hidden',
         textOverflow: 'ellipsis',
         whiteSpace: 'nowrap',
    },
});

const AdminProjectList = (props: ListProps) => {
    const classes = useListStyles();

     return (
          (<Root>
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
                        <DateField source="createdAt" locales="en-GB" showTime options={dateOptions} />
                        <DateField source="updatedAt" locales="en-GB" showTime options={dateOptions} />
                        <DateField source="start" locales="en-GB" />
                        <DateField source="suspense" locales="en-GB" />
                        <TextField source="status" />
                    </Datagrid>
               </List>
          </Root>)
     );
}

export default AdminProjectList;
