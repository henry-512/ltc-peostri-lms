import { styled } from '@mui/material/styles';
import { Datagrid, DateField, FunctionField, List, ListProps, NumberField, TextField } from 'react-admin';
import { IModuleTemplate } from 'src/util/types';
import { dateOptions } from 'src/util/dateFormatter';

const PREFIX = 'ProjectTemplateList';

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

const ProjectTemplateList = (props: ListProps) => {
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
                    {/*<TextField source="id" /> // TODO: Temporarily removing ID due to illegible ID's */}
                    <TextField source="title" />
                    <DateField source="createdAt" showTime options={dateOptions} />
                    <DateField source="updatedAt" showTime options={dateOptions} />
                    <TextField source="status" />
                    <NumberField source="ttc" label="template.project.fields.ttc_short" />
                    <FunctionField label="Steps" render={(record: Record<string, IModuleTemplate> | undefined) => `${Object.keys(record?.modules || {}).length}`} />
                </Datagrid>
            </List>
        </Root>)
    );
}

export default ProjectTemplateList;
