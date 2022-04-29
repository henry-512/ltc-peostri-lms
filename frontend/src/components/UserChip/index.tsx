/**
* @file Chip used on the datagrids to display an array list of users with their first and last name.
* @module UserChip
* @category UserChip
* @author Braden Cariaga
*/

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

/**
 * Chip used on the datagrids to display an array list of users with their first and last name.
 * @param {UserChipProps} props - UserChipProps
 */
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