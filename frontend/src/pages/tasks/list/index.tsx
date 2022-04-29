import { List, Datagrid, TextField, DateField, useCreatePath, ReferenceArrayField, ReferenceField } from "react-admin";
import AvatarGroupField from "src/components/AvatarGroupField";

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