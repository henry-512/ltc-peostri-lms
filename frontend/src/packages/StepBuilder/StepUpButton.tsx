import { styled } from '@mui/material/styles';
import { Button } from "react-admin";
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const PREFIX = 'StepUpButton';

const classes = {
     button: `${PREFIX}-button`,
     label: `${PREFIX}-label`
};

const StyledButton = styled(Button)((
     {
          theme
     }
) => ({
     [`& .${classes.button}`]: {
          minWidth: '0px',
          width: 'auto',
          padding: '.25rem'
     },

     [`& .${classes.label}`]: {
          width: 'auto'
     }
}));

const StepUpButton = ({label, onClick, disabled}: {label: string, onClick: any, disabled: boolean}) => {

     return (
          <StyledButton label={label} onClick={onClick} classes={classes} disabled={disabled}>
               <ArrowUpwardIcon />
          </StyledButton>
     );
}

export default StepUpButton;