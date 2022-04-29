import { List, Datagrid, TextField, BooleanField, DateField, useCreatePath, ReferenceArrayField, ReferenceField } from "react-admin";
import AvatarGroupField from "src/components/AvatarGroupField";
import { dateOptions } from "src/util/dateFormatter";

const TasksList = () => {
    const createPath = useCreatePath();

    return (
        <>
            <List>
                <Datagrid rowClick={(id, resource, record) => createPath({ resource: `modules`, id: record.module, type: 'show' })}
                    bulkActionButtons={<></>}
                >
                    <TextField source="title" />
                    <TextField source="status" />
                    <TextField source="type" />
                    <ReferenceArrayField reference="admin/users" source="users">
                        <AvatarGroupField />
                    </ReferenceArrayField>
                    <DateField source="suspense" />
                    <ReferenceField reference="modules" source="module">
                        <TextField source="title" />
                    </ReferenceField>
                    <ReferenceField reference="projects" source="project">
                        <TextField source="title" />
                    </ReferenceField>
                </Datagrid>
            </List>
        </>
    )
}

export default TasksList;