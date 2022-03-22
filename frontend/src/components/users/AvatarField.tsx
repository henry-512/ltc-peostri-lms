import Avatar from '@material-ui/core/Avatar';
import { FieldProps } from 'react-admin';
import { IUser } from 'src/util/types';

interface Props extends FieldProps<IUser> {
    className?: string;
    size?: string;
}

const AvatarField = ({ record, size = '25', className }: Props) =>
    record ? (
        <Avatar
            src={`${record.avatar}?size=${size}x${size}`}
            style={{ width: parseInt(size, 10), height: parseInt(size, 10) }}
            className={className}
        />
    ) : null;

export default AvatarField;