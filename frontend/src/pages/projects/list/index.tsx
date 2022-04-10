import { Datagrid, DateField, List, NumberField, TextField } from "react-admin";

const ProjectList = (props: any) => (
    <List {...props}>
        <Datagrid rowClick="show">
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="start" />
            <TextField source="status" />
            <DateField source="suspense" />
            <TextField source="modules.key-0" />
            <TextField source="users" />
            <TextField source="team" />
            <NumberField source="ttc" />
            <DateField source="createdAt" />
            <DateField source="updatedAt" />
        </Datagrid>
    </List>
);

export default ProjectList;