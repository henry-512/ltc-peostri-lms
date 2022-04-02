import { makeStyles } from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import { Button } from 'react-admin';

const useStyles = makeStyles(theme => ({
     button: {
          minWidth: '0px',
          width: 'auto',
          padding: '.25rem'
     },
     label: {
          width: 'auto'
     }
}));

const StepDownButton = ({label, onClick, disabled}: {label: string, onClick: any, disabled: boolean}) => {
     const classes = useStyles();
     return (
          <Button label={label} onClick={onClick} classes={classes} disabled={disabled}>
               <ArrowDownwardIcon />
          </Button>
     )
}
export default StepDownButton;