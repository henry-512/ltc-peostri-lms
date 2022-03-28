import { makeStyles } from '@material-ui/core';
import { Datagrid, DateField, FunctionField, List, ListProps, NumberField, TextField } from 'react-admin';
import { IModuleStep, IModuleTemplate, ITaskTemplate } from 'src/util/types';

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

const getTaskCount = (record?: Record<string, IModuleTemplate>) => {
    if (!record) return 0;

    let count = 0;
    for (let [stepKey, step] of Object.entries<ITaskTemplate[]>(record.tasks)) {
        for (let [taskKey, task] of Object.entries<ITaskTemplate>(step)) {
            count++;
        }
    }
    return count;
}

const ModuleTemplateList = (props: ListProps) => {
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
                        <NumberField source="ttc" label="template.module.fields.ttc_short" />
                        <FunctionField label="Steps" render={(record: Record<string, IModuleTemplate> | undefined) => `${Object.keys(record?.tasks || {}).length}`} />
                        <FunctionField label="Tasks" render={(record: Record<string, IModuleTemplate> | undefined) => `${getTaskCount(record)}`} />
                    </Datagrid>
               </List>
          </>
     );
}

export default ModuleTemplateList;
