import { MouseEventHandler } from "react";
import { Button } from "react-admin";
import PlaylistAddRoundedIcon from '@material-ui/icons/PlaylistAddRounded';

const AddStepButton = ({label, onClick, disabled}: {label: string | undefined, onClick: MouseEventHandler | undefined, disabled: boolean}) => (
     <Button label={label} onClick={onClick} color="primary" variant="contained" disabled={disabled}>
          <PlaylistAddRoundedIcon />
     </Button>
)

export default AddStepButton;