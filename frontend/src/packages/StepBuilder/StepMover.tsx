import { styled } from '@mui/material/styles';
import StepDownButton from "./StepDownButton";
import StepUpButton from "./StepUpButton";

const Root = styled('div')(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    [`& .MuiButton-root`]: {
        minWidth: '0px',
        width: 'auto',
        padding: '.25rem'
    },

    [`& .MuiButton-startIcon`]: {
        margin: '0'
    }
}));

const StepMover = ({ up, down, topEdge, botEdge }: { up: any, down: any, topEdge: boolean, botEdge: boolean }) => {

    return (
        <Root>
            <StepDownButton label="" onClick={down} disabled={(botEdge ? true : false)} />
            <StepUpButton label="" onClick={up} disabled={(topEdge ? true : false)} />
        </Root>
    );
}

export default StepMover;