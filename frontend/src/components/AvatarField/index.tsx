/**
* @file Component used to render the avatar image provided a record.
* @module AvatarField
* @category AvatarField
* @author Braden Cariaga
*/

import { Tooltip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { FieldProps, useRecordContext } from 'react-admin';
import { IUser } from 'src/util/types';

export interface AvatarFieldProps extends FieldProps<IUser> {
    record?: any
    className?: string;
    size?: string;
}

/**
 * Component used to render the avatar image provided a record.
 * @param {AvatarFieldProps} props - AvatarFieldProps
 */
const AvatarField = ({ size = '25', className }: AvatarFieldProps) => {
    const record = useRecordContext();

    if (!record) return null;

    return (
        <Tooltip title={`${record.firstName} ${record.lastName}`}>
            <Avatar
                src={`${record?.avatar}`}
                style={{ width: parseInt(size, 10), height: parseInt(size, 10) }}
                className={className}
            />
        </Tooltip>
    )
};

export default AvatarField;