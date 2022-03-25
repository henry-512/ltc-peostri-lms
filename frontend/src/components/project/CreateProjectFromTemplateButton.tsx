import { Button } from 'react-admin';
import AddIcon from '@material-ui/icons/Add';
import { MouseEventHandler } from 'react';

const CreateProjectFromTemplateButton = ({ label, onClick, variant = "contained" }: { label: string | undefined, onClick: MouseEventHandler | undefined, variant?: 'contained' | 'outlined' | 'text' }) => (
    <Button label={label} onClick={onClick} color="primary" variant={variant}>
        <AddIcon />
    </Button>
)

export default CreateProjectFromTemplateButton;