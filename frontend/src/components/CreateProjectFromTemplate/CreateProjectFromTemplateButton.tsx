/**
* @file Opener button for creating a project from a template.
* @module CreateProjectFromTemplateButton
* @category CreateProjectFromTemplate
* @author Braden Cariaga
*/

import { Button } from 'react-admin';
import AddIcon from '@mui/icons-material/Add';
import { MouseEventHandler } from 'react';

export type CreateProjectFromTemplateButtonProps = { 
    label: string | undefined, 
    onClick: MouseEventHandler | undefined, 
    variant?: 'contained' | 'outlined' | 'text' 
}

/**
 * Opener button for creating a project from a template.
 * @param {CreateProjectFromTemplateButtonProps} props - CreateProjectFromTemplateButtonProps
 */
const CreateProjectFromTemplateButton = ({ label, onClick, variant = "contained" }: CreateProjectFromTemplateButtonProps) => (
    <Button label={label} onClick={onClick} color="primary" variant={variant}>
        <AddIcon />
    </Button>
)

export default CreateProjectFromTemplateButton;