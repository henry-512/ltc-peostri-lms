import { Datagrid, DateField, FunctionField, List, ListProps, NumberField, TextField } from 'react-admin';
import { IModuleTemplate } from 'src/util/types';
import { dateOptions } from 'src/util/dateFormatter';

const ProjectTemplateList = (props: ListProps) => {

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
                    },
                    [`& .RaDatagrid-headerCell`]: {
                        padding: '6px 8px 6px 8px',
                    },
                    [`& .RaDatagrid-rowCell`]: {
                        padding: '6px 8px 6px 8px',
                    }
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
    );
}

export default ProjectTemplateList;
