/**
* @file Component used to render the avatar image provided a record.
* @module AvatarField
* @category AvatarField
* @author Braden Cariaga
*/

import Avatar from '@mui/material/Avatar';
import { FieldProps } from 'react-admin';
import { IUser } from 'src/util/types';

export interface AvatarFieldProps extends FieldProps<IUser> {
    className?: string;
    size?: string;
}

/**
 * Component used to render the avatar image provided a record.
 * @param {AvatarFieldProps} props 
 */
const AvatarField = ({ record, size = '25', className }: AvatarFieldProps) =>
record ? (
    <Avatar
        src={`${record.avatar}?size=${size}x${size}`}
        style={{ width: parseInt(size, 10), height: parseInt(size, 10) }}
        className={className}
    />
) : null;

export default AvatarField;