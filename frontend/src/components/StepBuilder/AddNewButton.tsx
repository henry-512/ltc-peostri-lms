/**
* @file Add new content button used on the step builder.
* @module AddNewButton
* @category StepBuilder
* @author Braden Cariaga
*/

import { MouseEventHandler } from "react";
import { Button } from "react-admin";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AddNewButton = ({ label, onClick }: { label: string | undefined, onClick: MouseEventHandler | undefined }) => (
    <Button label={label} onClick={onClick} color="primary" variant="contained">
        <AddCircleOutlineIcon />
    </Button>
)

export default AddNewButton;