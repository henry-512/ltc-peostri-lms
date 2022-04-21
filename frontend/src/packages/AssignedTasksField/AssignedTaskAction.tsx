import { useState } from "react";
import TaskActionUpload from "./TaskActionUpload";
import TaskActionReview from "./TaskActionReview";
import TaskActionWaiveApprove from "./TaskActionWaiveApprove";
import TaskActionApprove from "./TaskActionApprove";

export type AssignedTaskActionProps = {
    id: string
    type?: string
}

const AssignedTaskAction = ({ id, type }: AssignedTaskActionProps) => {
    const [open, setOpen] = useState<string>("");

    switch (type) {
        case 'DOCUMENT_UPLOAD':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_REVIEW':
            return (
                <TaskActionReview id={id} open={(open == "DOCUMENT_REVIEW")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_REVIEW")} />
            )
        case 'DOCUMENT_REVISE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_REVISE")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_REVISE")} />
            )
        case 'WAIVER_APPROVE':
            return (
                <TaskActionWaiveApprove id={id} open={(open == "WAIVER_APPROVE")} close={() => setOpen("")} setOpen={() => setOpen("WAIVER_APPROVE")} />
            )
        case 'DOCUMENT_APPROVE':
            return (
                <TaskActionApprove id={id} open={(open == "DOCUMENT_APPROVE")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_APPROVE")} />
            )
        default:
            return null
    }
}

export default AssignedTaskAction;