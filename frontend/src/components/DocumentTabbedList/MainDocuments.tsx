
import { Typography, Box } from "@mui/material";
import Container from "src/components/DocumentTabber/Container";
import AvatarField from "src/components/AvatarField";
import { dateOptions } from "src/util/dateFormatter";
import DocumentViewer from "src/components/DocumentViewer";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { useState } from "react";
import { Datagrid, TextField, RaRecord, useShowContext, DateField, ReferenceField, FileField, DatagridHeader, FunctionField } from "react-admin";

const MainDocuments = ({ record }: { record: RaRecord }) => {
    const [documentView, setDocumentView] = useState("");
    const [documentSrc, setDocumentSource] = useState("");

    const openMainDocument = () => {
        setDocumentView(record?.files?.latest?.title);
        setDocumentSource(record?.files?.latest?.src);
    }
    const closeDocumentViewer = () => {
        setDocumentView("");
        setDocumentSource("");
    }

    return (
        <Box display="flex" flexDirection="column" gap="1rem">
            <Typography mb="-.75rem" variant="h6">Latest File:</Typography>
            <Box 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center" 
                width="100%" 
                sx={{
                    border: (theme) => `1px solid ${theme.palette.borderColor?.main}`,
                    borderRadius: '10px',
                    padding: (theme) => theme.spacing(1),
                    boxSizing: 'border-box',
                    transition: 'all .2s',
                    '&:hover': {
                        backgroundColor: (theme) => theme.palette?.borderColor?.main,
                        transition: 'all .2s',
                        cursor: 'pointer'
                    }
                }}
                onClick={openMainDocument}
            >
                <Box display="flex" gap="8px">
                    <FilePresentIcon color="secondary" />
                    <Typography>{record?.files?.latest?.title}</Typography>
                </Box>
                <DateField record={record?.files?.latest} source='createdAt' showTime locales="en-GB" options={dateOptions} />
                <ReferenceField record={record?.files?.latest} source="author" reference="admin/users">
                    <AvatarField />
                </ReferenceField>
            </Box>
            {(record?.files?.old && record?.files?.old?.length > 0) ?
                <Box>
                    <Container
                        title={"Old Files"}
                        startOpen={true}
                        id="old-files"
                    >
                        <Datagrid
                            data={record?.files?.old}
                            total={record?.files?.old.length}
                            isLoading={false}
                            bulkActionButtons={false}
                            sort={{ field: 'title', order: 'ASC' }}
                        >
                            <FunctionField render={(record: any) => `${record.title.split('.')[0]}`} source="title" />
                            <FileField source="src" title="title" label="Document" target="_blank" />
                            <DateField source='createdAt' showTime locales="en-GB" options={dateOptions} />
                            <ReferenceField reference="admin/users" source="author" >
                                <AvatarField />
                            </ReferenceField>
                        </Datagrid>
                    </Container>
                </Box>
            : null }
            <DocumentViewer 
                src={documentSrc} 
                open={(documentView != "" && documentSrc != "")} 
                handleClose={closeDocumentViewer} 
                ariaLabel={"document-viewer-" + documentView.toLowerCase().replace(" ", "-")} 
                label={"Viewing Document: " + documentView} 
                maxWidth="md"
            />
        </Box>
    )
}

export default MainDocuments