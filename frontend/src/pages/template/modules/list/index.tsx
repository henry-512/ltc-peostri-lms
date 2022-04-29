/**
* @file Template Module List file.
* @module TemplateModuleList
* @category TemplateModulesPage
* @author Braden Cariaga
*/

import { Datagrid, DateField, FunctionField, List, ListProps, NumberField, TextField } from 'react-admin';
import { IModuleTemplate, ITaskTemplate } from 'src/util/types';
import { dateOptions } from 'src/util/dateFormatter';

const getTaskCount = (record?: Record<string, IModuleTemplate>) => {
    if (!record) return 0;

    let count = 0;
    for (let [, step] of Object.entries<ITaskTemplate[]>(record.tasks)) {
        for (let _ of Object.entries<ITaskTemplate>(step)) {
            count++;
        }
    }
    return count;
}

const ModuleTemplateList = (props: ListProps) => {

    return (
        <List {...props}
            perPage={25}
        >
            <Datagrid
                sx={{
                    [`& .RaDatagrid-headerRow`]: {
                        borderLeftColor: 'transparent',
                        borderLeftWidth: 5,
                        borderLeftStyle: 'solid',
                    }
                }}
                rowClick="edit"
            >
                <TextField source="title" />
                <DateField source="createdAt" showTime options={dateOptions} />
                <DateField source="updatedAt" showTime options={dateOptions} />
                <TextField source="status" />
                <NumberField source="ttc" label="template.module.fields.ttc_short" />
                <FunctionField label="Steps" render={(record: Record<string, IModuleTemplate> | undefined) => `${Object.keys(record?.tasks || {}).length}`} />
                <FunctionField label="Tasks" render={(record: Record<string, IModuleTemplate> | undefined) => `${getTaskCount(record)}`} />
            </Datagrid>
        </List>
    );
}

export default ModuleTemplateList;
