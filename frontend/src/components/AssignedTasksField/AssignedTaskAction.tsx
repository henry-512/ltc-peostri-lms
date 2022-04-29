/**
* @file Task action button which resolves the correct buttons based on the task type provided.
* @module AssignedTaskAction
* @category AssignedTasksField
* @author Braden Cariaga
*/

import { useState } from "react";
import TaskActionUpload from "./TaskActionUpload";
import TaskActionReview from "./TaskActionReview";
import TaskActionWaiveApprove from "./TaskActionWaiveApprove";
import TaskActionApprove from "./TaskActionApprove";
import TaskActionRevise from "./TaskActionRevise";

export type AssignedTaskActionProps = {
    id: string
    type?: string
    record: any
}

/**
 * A Task action button which resolves the correct buttons based on the task type provided.
 * @param {AssignedTaskActionProps} props - AssignedTaskActionProps
 */
const AssignedTaskAction = ({ id, type, record }: AssignedTaskActionProps) => {
    const [open, setOpen] = useState<string>("");

    switch (type) {
        case 'DOCUMENT_UPLOAD':
            return (
                <TaskActionUpload id={id} open={(open === "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} record={record} />
            )
        case 'DOCUMENT_REVIEW':
            return (
                <TaskActionReview id={id} open={(open === "DOCUMENT_REVIEW")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_REVIEW")} record={record}/>
            )
        case 'DOCUMENT_REVISE':
            return (
                <TaskActionRevise id={id} open={(open === "DOCUMENT_REVISE")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_REVISE")} record={record}/>
            )
        case 'WAIVER_APPROVE':
            return (
                <TaskActionWaiveApprove id={id} open={(open === "WAIVER_APPROVE")} close={() => setOpen("")} setOpen={() => setOpen("WAIVER_APPROVE")} record={record}/>
            )
        case 'DOCUMENT_APPROVE':
            return (
                <TaskActionApprove id={id} open={(open === "DOCUMENT_APPROVE")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_APPROVE")} record={record}/>
            )
        default:
            return null
    }
}

export default AssignedTaskAction;