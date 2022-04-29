import { Button } from "react-admin";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const StepUpButton = ({ label, onClick, disabled }: { label: string, onClick: any, disabled: boolean }) => {

    return (
        <Button label={label} onClick={onClick} disabled={disabled}>
            <ArrowUpwardIcon />
        </Button>
    );
}

export default StepUpButton;