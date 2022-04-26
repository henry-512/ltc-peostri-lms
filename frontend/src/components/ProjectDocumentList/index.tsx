import { useShowContext, ReferenceManyField, Datagrid, FileField, TextField, FunctionField, DateField } from "react-admin";
import AvatarField from "src/components/AvatarField";
import { dateOptions } from "src/util/dateFormatter";

const ProjectDocumentList = () => {
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
                    <FileField source="files.latest.src" title="files.latest.title" label="Document" target="_blank" />
                    <DateField source='files.latest.createdAt' label="Created" showTime locales="en-GB" options={dateOptions} />
                    <FunctionField source="author" render={(record: any) => (
                        (record?.files?.latest) ? 
                            <AvatarField record={record?.files?.latest.author}/>
                    : null)} />
                </Datagrid>
            </ReferenceManyField>
        </>
    )
}

export default ProjectDocumentList;