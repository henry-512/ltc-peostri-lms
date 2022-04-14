import { styled } from '@mui/material/styles';
import StepDownButton from "./StepDownButton";
import StepUpButton from "./StepUpButton";

const PREFIX = 'StepMover';

const classes = {
     stepMover: `${PREFIX}-stepMover`
};

const Root = styled('div')((
     {
          theme
     }
) => ({
     [`&.${classes.stepMover}`]: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
     }
}));

const StepMover = ({up, down, topEdge, botEdge}: {up: any, down: any, topEdge: boolean, botEdge: boolean}) => {

     return (
          <Root className={classes.stepMover}>
               <StepDownButton label="" onClick={down} disabled={(botEdge ? true : false)}/>
               <StepUpButton label="" onClick={up}  disabled={(topEdge ? true : false)}/>
          </Root>
     );
}

export default StepMover;