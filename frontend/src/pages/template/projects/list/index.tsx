import { makeStyles } from '@material-ui/core';
import { Datagrid, DateField, FunctionField, List, ListProps, NumberField, TextField } from 'react-admin';
import { IModuleTemplate } from 'src/util/types';

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

const ProjectTemplateList = (props: ListProps) => {
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
                    <TextField source="status" />
                    <NumberField source="ttc" label="template.project.fields.ttc_short" />
                    <FunctionField label="Steps" render={(record: Record<string, IModuleTemplate> | undefined) => `${Object.keys(record?.modules || {}).length}`} />
                </Datagrid>
            </List>
        </>
    );
}

export default ProjectTemplateList;
