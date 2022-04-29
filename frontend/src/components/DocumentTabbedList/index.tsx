/**
* @file Creates a vertical tabbed list with a DocumentTabber.
* @module DocumentTabbedList
* @category DocumentTabbedList
* @author Braden Cariaga
*/

import { useShowContext } from "react-admin";
import { useState } from "react";
import DocumentTabber from "src/components/DocumentTabber";
import MainDocuments from "./MainDocuments";
import RevisionDocuments from "./RevisionDocuments";

/**
 * Creates a vertical tabbed list with a DocumentTabber.
 */
const DocumentTabbedList = () => {
    /* Getting the record from the useShowContext hook. */
    const {
        record
    } = useShowContext();

    /* This is creating an object that will be used to create the tabs. */
    const mainDocuments = {
        latest: record.files?.latest || null,
        old: record.files?.old || []
    }
    /* This is creating an object that will be used to create the tabs. */
    const revisionDocuments = {
        latest: record.files?.reviews || [],
        old: record.files?.oldReviews || []
    }
    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    /* This is creating an array of objects that will be used to create the tabs. */
    const tabOptions = [];
    tabOptions.push({ name: 'Main', content: mainDocuments, element: <MainDocuments record={record} /> });
    if (record.files?.reviews.length > 0 || record.files?.oldReviews.length > 0) tabOptions.push({ name: 'Revisions', content: revisionDocuments, container: false, element: <RevisionDocuments record={record} /> });

    /* Returning the DocumentTabber component with the tab, tabOptions and handleChange props. */
    return (
        <>
            <DocumentTabber tab={tab} tabOptions={tabOptions} handleChange={handleChange} />
        </>
    )
}

export default DocumentTabbedList;