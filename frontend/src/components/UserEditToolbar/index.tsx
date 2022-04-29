/**
* @file Top action bar used by the admin users editing.
* @module UserEditToolbar
* @category UserEditToolbar
* @author Braden Cariaga
*/

import { EditActionsProps, ShowButton, TopToolbar } from "react-admin";


/**
 * Top action bar used by the admin users editing.
 * @param {EditActionsProps} props - EditActionsProps
 */
const UserEditToolbar = ({ data, resource }: EditActionsProps) => (
    <TopToolbar>
        <ShowButton record={data} />
    </TopToolbar>
)

export default UserEditToolbar;