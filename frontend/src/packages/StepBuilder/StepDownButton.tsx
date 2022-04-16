import { styled } from '@mui/material/styles';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Button } from 'react-admin';

const StepDownButton = ({ label, onClick, disabled }: { label: string, onClick: any, disabled: boolean }) => {

    return (
        <Button label={label} onClick={onClick} disabled={disabled}>
            <ArrowDownwardIcon />
        </Button>
    );
}
export default StepDownButton;