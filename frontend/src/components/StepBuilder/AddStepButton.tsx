/**
* @file Add new step button used on the step builder.
* @module AddStepButton
* @category StepBuilder
* @author Braden Cariaga
*/

import { MouseEventHandler } from "react";
import { Button } from "react-admin";
import PlaylistAddRoundedIcon from '@mui/icons-material/PlaylistAddRounded';

const AddStepButton = ({label, onClick, disabled}: {label: string | undefined, onClick: MouseEventHandler | undefined, disabled: boolean}) => (
     <Button label={label} onClick={onClick} color="primary" variant="contained" disabled={disabled}>
          <PlaylistAddRoundedIcon />
     </Button>
)

export default AddStepButton;