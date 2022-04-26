import { useShowContext } from "react-admin";
import { useState } from "react";
import DocumentTabber from "src/components/DocumentTabber";
import MainDocuments from "./MainDocuments";
import RevisionDocuments from "./RevisionDocuments";

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
    if (record.files?.reviews.length > 0 || record.files?.oldReviews.length > 0) tabOptions.push({ name: 'Revisions', content: revisionDocuments, container: false, element: <RevisionDocuments record={record} /> });

    return (
        <>
            <DocumentTabber tab={tab} tabOptions={tabOptions} handleChange={handleChange} />
        </>
    )
}

export default DocumentTabbedList;