import { List, Datagrid, TextField, BooleanField, DateField, useCreatePath } from "react-admin";
import { dateOptions } from "src/util/dateFormatter";

const NotificationList = () => {
    const createPath = useCreatePath();

    return (
        <>
            <List>
                <Datagrid rowClick={(id, resource, record) => createPath({ resource: `${record.sender.resource}`, id: record.sender.id, type: 'show' })}
                    bulkActionButtons={<></>}
                >
                    <DateField source='createdAt' showTime locales="en-GB" options={dateOptions} />
                    <TextField source="content" />
                    <TextField source="type" />
                    <BooleanField source="read" />
                </Datagrid>
            </List>
        </>
    )
}

export default NotificationList;