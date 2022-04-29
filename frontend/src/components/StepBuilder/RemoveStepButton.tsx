/**
* @file Remove step button used on the step builder.
* @module AddStepButton
* @category StepBuilder
* @author Braden Cariaga
*/

import { MouseEventHandler } from "react";
import { Button } from "react-admin";
import RemoveCircleOutline from '@mui/icons-material/RemoveCircleOutline';

export type RemoveStepButtonProps = {
    label: string | undefined,
    onClick: MouseEventHandler | undefined,
    disabled: boolean
}

const RemoveStepButton = ({ label, onClick, disabled }: RemoveStepButtonProps) => (
    <Button label={label} onClick={onClick} color="primary" disabled={disabled}>
        <RemoveCircleOutline />
    </Button>
)

export default RemoveStepButton;