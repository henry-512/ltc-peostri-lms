import { Chip } from "@mui/material";
import { styled } from '@mui/material/styles';
import { IUser } from "src/util/types";

const PREFIX = 'RaChipField';

const classes = {
    chip: `${PREFIX}-chip`
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled('div')({
    [`& .${classes.chip}`]: { margin: 4, cursor: 'inherit' },
});

export type UserChipProps = {
    basePath?: string
    onClick?: any
    record?: IUser
    resource?: string
}

const UserChip = (props: UserChipProps) => {

    
    return (props.record) ?
    (
        <Chip
            className={classes.chip}
            label={props.record.firstName + " " + props.record.lastName} 
        />
    ) : ((<Root></Root>));
}

export default UserChip