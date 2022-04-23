import { Datagrid, TextField, RaRecord, useShowContext } from "react-admin";
import { useState } from "react";
import DocumentTabber from "src/packages/DocumentTabber";
import { Typography, Box } from "@mui/material";
import Container from "src/packages/DocumentTabber/Container";

const MainDocuments = ({ record }: { record: RaRecord }) => {

    return (
        <>
            <Box display="flex" width="100%" sx={{
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
            }}>
                <Typography>{record?.files?.latest?.title}</Typography>
            </Box>
            {(record?.files?.old && record?.files?.old?.length > 0) ?
                <Container
                    title="Old Filesss"
                    startOpen={false}
                    id="old-files"
                >
                    <Datagrid
                        data={record?.files?.old}
                        total={record?.files?.old.length}
                        isLoading={false}
                        bulkActionButtons={false}
                    >
                        <TextField source="title" />
                        {/*<FileField source="src" title="title" label="Document" />*/}
                        <TextField source="author" label="Author" />
                    </Datagrid>
                </Container>
            : null }
        </>
    )
}

const DocumentTabbedList = () => {
    const {
        record
    } = useShowContext();

    const mainDocuments = {
        latest: record.files?.latest || null,
        old: record.files?.old || []
    }
    const revisionDocuments = {
        latest: record.files?.reviews || [],
        old: record.files?.oldReviews || []
    }
    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const tabOptions = [];
    tabOptions.push({ name: 'Main', content: mainDocuments, element: <MainDocuments record={record} /> });
    if (record.files?.reviews.length > 0 || record.files?.oldReviews.length > 0) tabOptions.push({ name: 'Revisions', content: revisionDocuments, container: true, element: <></> });

    return (
        <>
            <DocumentTabber tab={tab} tabOptions={tabOptions} handleChange={handleChange} />
        </>
    )
}

export default DocumentTabbedList;