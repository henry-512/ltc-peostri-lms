import Avatar from '@mui/material/Avatar';
import { FieldProps } from 'react-admin';
import { IUser } from 'src/util/types';

export interface AvatarFieldProps extends FieldProps<IUser> {
    className?: string;
    size?: string;
}

const AvatarField = ({ record, size = '25', className }: AvatarFieldProps) =>
    record ? (
        <Avatar
            src={`${record.avatar}?size=${size}x${size}`}
            style={{ width: parseInt(size, 10), height: parseInt(size, 10) }}
            className={className}
        />
    ) : null;

export default AvatarField;