/**
* @file Title used for the user, which displays the users first and last name with their title. 
* @module UserEditTitle
* @category UserEditTitle
* @author Braden Cariaga
*/

import { FieldProps, useTranslate } from "react-admin";
import { IUser } from "src/util/types";

/**
 * Toolbar used on the Admin Users Edit and Create
 * @param {FieldProps<IUser>} props - FieldProps<IUser>
 */
const UserEditTitle = ({ record }: FieldProps<IUser>) => {
    const translate = useTranslate();

    return record ? (
        <>
            {translate('user.layout.edit_title', { name: record.firstName + " " + record.lastName })}
        </>
    ) : null
}

export default UserEditTitle;