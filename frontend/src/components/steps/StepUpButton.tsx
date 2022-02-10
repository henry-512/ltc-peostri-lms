import { makeStyles } from "@material-ui/core";
import { Button } from "react-admin";
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';

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

const StepUpButton = ({label, onClick, disabled}: {label: string, onClick: any, disabled: boolean}) => {
     const classes = useStyles();
     return (
          <Button label={label} onClick={onClick} classes={classes} disabled={disabled}>
               <ArrowUpwardIcon />
          </Button>
     )
}

export default StepUpButton;