import { Button } from 'react-admin';
import AddCircleOutlineIcon from '@material-ui/icons/AddCircleOutline';
import { MouseEventHandler } from 'react';

export type AddTemplateModuleButtonProps = {
    label?: string
    onClick?: MouseEventHandler
}

const AddTemplateModuleButton = ({ label, onClick }: AddTemplateModuleButtonProps) => (
    <Button label={label} onClick={onClick} color="primary" variant="contained">
        <AddCircleOutlineIcon />
    </Button>
)

export default AddTemplateModuleButton;