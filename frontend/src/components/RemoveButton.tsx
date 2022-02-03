import { makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/RemoveCircleOutline';
import { Button, ButtonProps } from 'react-admin';

const useStyles = makeStyles(theme => ({
     root: {
          minWidth: '0px',
          width: 'auto'
     }
}))

export const RemoveButton = (props: Omit<ButtonProps, 'onClick'>) => {
     const classes = useStyles();
     return (
          <Button label="" {...props} className={classes.root}>
               <CloseIcon />
          </Button>
     );
};