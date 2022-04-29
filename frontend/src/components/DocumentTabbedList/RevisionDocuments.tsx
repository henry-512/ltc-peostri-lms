/**
* @file Displays the revision documents of a module.
* @module RevisionDocuments
* @category DocumentTabbedList
* @author Braden Cariaga
*/
import { Typography, Box } from "@mui/material";
import Container from "src/components/DocumentTabber/Container";
import AvatarField from "src/components/AvatarField";
import { dateOptions } from "src/util/dateFormatter";
import DocumentViewer from "src/components/DocumentViewer";
import FilePresentIcon from '@mui/icons-material/FilePresent';
import { useState } from "react";
import { Datagrid, RaRecord, DateField, ReferenceField, FileField, FunctionField } from "react-admin";

/**
 * A React component that displays the revision documents of a module and allows the user to view them. 
 */
const RevisionDocuments = ({ record }: { record: RaRecord }) => {
    const [documentView, setDocumentView] = useState("");
    const [documentSrc, setDocumentSource] = useState("");

    /**
     * "openDocument" is a function that takes a fileRecord as an argument and sets the state of the
     * documentView and documentSource to the title and src of the fileRecord.
     * @param {any} fileRecord - any - this is the file record that is passed to the function.
     */
    const openDocument = (fileRecord: any) => {
        setDocumentView(fileRecord.title);
        setDocumentSource(fileRecord.src);
    }
    /**
     * When the user clicks the close button, the document viewer is closed and the document source is
     * set to an empty string.
     */
    const closeDocumentViewer = () => {
        setDocumentView("");
        setDocumentSource("");
    }

    return (
        <Box display="flex" flexDirection="column" gap="1rem">
            <Typography mb="-.75rem" variant="h6">Latest Revision File(s):</Typography>
            <Box display="flex" flexDirection="column" gap=".25rem">
                {record.files.reviews.map((reviewFile: any) => (
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
                        onClick={() => openDocument(reviewFile)}
                    >
                        <Box display="flex" gap="8px">
                            <FilePresentIcon color="secondary" />
                            <Typography>{reviewFile.title}</Typography>
                        </Box>
                        <DateField record={reviewFile} source='createdAt' showTime locales="en-GB" options={dateOptions} />
                        <ReferenceField record={reviewFile} source="author" reference="admin/users">
                            <AvatarField />
                        </ReferenceField>
                    </Box>
                ))}
            </Box>
            {(record?.files?.oldReviews && record?.files?.oldReviews?.length > 0) ?
                <Box>
                    <Container
                        title={"Old Files"}
                        startOpen={true}
                        id="old-files"
                    >
                        <Datagrid
                            data={record?.files?.oldReviews}
                            total={record?.files?.oldReviews.length}
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
                open={(documentView !== "" && documentSrc !== "")} 
                handleClose={closeDocumentViewer} 
                ariaLabel={"document-viewer-" + documentView.toLowerCase().replace(" ", "-")} 
                label={"Viewing Document: " + documentView} 
                maxWidth="md"
            />
        </Box>
    )
}

export default RevisionDocuments