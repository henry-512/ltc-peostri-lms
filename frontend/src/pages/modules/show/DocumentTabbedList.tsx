import { Datagrid, DateField, ReferenceArrayField, ReferenceField, TextField, useShowContext } from "react-admin";
import { useState } from "react";
import statusRowStyle from "src/util/statusRowStyle";
import AvatarGroupField from "src/components/users/AvatarGroupField";
import DocumentTabber from "src/packages/DocumentTabber";
import { Typography } from "@mui/material";
import Container from "src/packages/DocumentTabber/Container";
import { IModule } from "src/util/types";

const MainDocuments = (record: any) => {

    return (
        <>
            <Typography>{record.files?.latest?.title}</Typography>
            {(record?.files?.old && record?.files?.old?.length > 0) ?
                <Container
                    title="Old Filesss"
                    startOpen={false}
                    id="old-files"
                >
                    {record?.files?.old.map((file: any, index: number) => {
                        return (
                            <Typography>{file}</Typography>
                        )
                    })}
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