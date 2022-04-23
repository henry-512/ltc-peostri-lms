import { useShowContext, ReferenceManyField, Datagrid, FileField, TextField } from "react-admin";

const DocumentList = () => {
    const {
        record
    } = useShowContext();

    return (
        <>
            <ReferenceManyField record={record} reference="modules" target="project">
                <Datagrid
                    bulkActionButtons={false}
                >
                    <TextField source="title" />
                    <FileField source="files.latest.src" title="files.latest.title" label="Document" />
                    <TextField source="files.latest.createdAt" label="Created" />
                    <TextField source="files.latest.author" label="Author" />
                </Datagrid>
            </ReferenceManyField>
        </>
    )
}

export default DocumentList;