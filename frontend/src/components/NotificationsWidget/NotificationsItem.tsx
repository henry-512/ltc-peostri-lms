import { INotification } from "src/util/types";

export type NotificationsItemProps = {
    record: INotification
}

const NotificationsItem = (props: NotificationsItemProps) => {

    return (
        <>
            <h1>{props.record.content}</h1>
        </>
    )
}

export default NotificationsItem;