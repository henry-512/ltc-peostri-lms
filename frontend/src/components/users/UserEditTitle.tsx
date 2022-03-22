import { FieldProps, useTranslate } from "react-admin";
import { IUser } from "src/util/types";

const UserEditTitle = ({ record }: FieldProps<IUser>) => {
    const translate = useTranslate();

    return record ? (
        <>
            {translate('user.layout.edit_title', { name: record.firstName + " " + record.lastName })}
        </>
    ) : null
}

export default UserEditTitle;