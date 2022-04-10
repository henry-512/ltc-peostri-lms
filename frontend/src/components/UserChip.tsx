import { Chip, makeStyles } from "@material-ui/core";
import { IUser } from "src/util/types";

const useStyles = makeStyles(
    {
        chip: { margin: 4, cursor: 'inherit' },
    },
    { name: 'RaChipField' }
);

export interface UserChipProps {
    basePath?: string
    onClick?: any
    record?: IUser
    resource?: string
}

const UserChip = (props: UserChipProps) => {
    const classes = useStyles();
    
    return (props.record) ?
    (
        <Chip
            className={classes.chip}
            label={props.record.firstName + " " + props.record.lastName} 
        />
    ) : (<></>)
}

export default UserChip