/**
* @file Button component for adding a module to the module manager from a template.
* @module AddTemplateModuleButton
* @category AddTemplateModule
* @author Braden Cariaga
*/

import { Button } from 'react-admin';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { MouseEventHandler } from 'react';

export type AddTemplateModuleButtonProps = {
    label?: string
    onClick?: MouseEventHandler
}

/**
 * This function takes in a label and an onClick function and returns a button with the label and
 * onClick function passed in.
 * @param {AddTemplateModuleButtonProps} props
 */
const AddTemplateModuleButton = ({ label, onClick }: AddTemplateModuleButtonProps) => (
    <Button label={label} onClick={onClick} color="primary" variant="contained">
        <AddCircleOutlineIcon />
    </Button>
)

export default AddTemplateModuleButton;