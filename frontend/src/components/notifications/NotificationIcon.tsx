import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { NotificationTypes } from 'src/util/types';

export type NotificationIconProps = {
    type: NotificationTypes
    size?: "small" | "inherit" | "medium" | "large"
}

const NotificationIcon = (props: NotificationIconProps) => {
    switch(props.type) {
        case 'PROJECT':
            return <CheckBoxIcon fontSize={props.size || "large"} />
        case 'MODULE':
            return <ViewModuleIcon fontSize={props.size || "large"} />
        case 'TASK':
            return <AssignmentIcon fontSize={props.size || "large"} />
        case 'USER':
            return <AccountCircleIcon fontSize={props.size || "large"} />
        default:
            return <CheckBoxIcon fontSize={props.size || "large"} />
    }
}

export default NotificationIcon;