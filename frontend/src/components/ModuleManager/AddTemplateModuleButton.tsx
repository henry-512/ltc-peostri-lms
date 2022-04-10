import { Button } from 'react-admin';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { MouseEventHandler } from 'react';

const AddTemplateModuleButton = ({ label, onClick }: { label: string | undefined, onClick: MouseEventHandler | undefined }) => (
    <Button label={label} onClick={onClick} color="primary" variant="contained">
        <AddCircleOutlineIcon />
    </Button>
)

export default AddTemplateModuleButton;