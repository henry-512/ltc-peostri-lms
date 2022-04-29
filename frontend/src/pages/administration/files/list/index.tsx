import { Datagrid, FileField, DeleteButton, List, ListProps, TextField, ReferenceField } from 'react-admin';
import AvatarField from 'src/components/AvatarField';

// TODO: Enable viewing documents

const AdminFilesList = (props: ListProps) => {

    return (
        <>
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
                >
                    <FileField source="src" title="title" src="src" target="_blank" />
                    <TextField source="id" />
                    <ReferenceField reference="admin/users" source="author">
                        <AvatarField /> 
                    </ReferenceField>
                    <DeleteButton />
                </Datagrid>
            </List>
        </>
    );
}

export default AdminFilesList;
