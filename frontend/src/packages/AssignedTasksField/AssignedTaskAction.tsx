import { useState } from "react";
import TaskActionUpload from "./TaskActionUpload";

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
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_REVISE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'WAIVER_APPROVE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        case 'DOCUMENT_APPROVE':
            return (
                <TaskActionUpload id={id} open={(open == "DOCUMENT_UPLOAD")} close={() => setOpen("")} setOpen={() => setOpen("DOCUMENT_UPLOAD")} />
            )
        default:
            return null
    }
}

export default AssignedTaskAction;