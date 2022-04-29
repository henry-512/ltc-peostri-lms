/**
* @file Move step down used on the step mover.
* @module StepDownButton
* @category StepBuilder
* @author Braden Cariaga
*/

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