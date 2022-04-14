import { styled } from '@mui/material/styles';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Button } from 'react-admin';

const PREFIX = 'StepDownButton';

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

const StepDownButton = ({label, onClick, disabled}: {label: string, onClick: any, disabled: boolean}) => {

     return (
          <StyledButton label={label} onClick={onClick} classes={classes} disabled={disabled}>
               <ArrowDownwardIcon />
          </StyledButton>
     );
}
export default StepDownButton;