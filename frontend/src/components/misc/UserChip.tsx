import { Chip } from "@mui/material";
import { styled } from '@mui/material/styles';
import { IUser } from "src/util/types";

const PREFIX = 'RaChipField';

const classes = {
    chip: `${PREFIX}-chip`
};

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
        <Root>
            <Chip
                className={classes.chip}
                label={props.record.firstName + " " + props.record.lastName} 
            />
        </Root>
    ) : ((<></>));
}

export default UserChip