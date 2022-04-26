import { Datagrid, FileField, DeleteButton, List, ListProps, TextField, ReferenceField } from 'react-admin';
import ProjectEmptyList from 'src/components/ProjectEmptyList';
import ProjectListActions from 'src/components/ProjectListActions';
import AvatarField from 'src/components/AvatarField';
import DocumentViewer from 'src/components/DocumentViewer';
import { Button } from '@mui/material';

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
                    <FileField source="src" title="title" src="src"  />
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
