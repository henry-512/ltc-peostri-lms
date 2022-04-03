import { makeStyles } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/RemoveCircleOutline';
import { Button, ButtonProps } from 'react-admin';

const useStyles = makeStyles(theme => ({
    button: {
        minWidth: '0px',
        width: 'auto',
        margin: '.75rem -.25rem .75rem 1.25rem',
        padding: '.25rem'
    },
    label: {
        width: 'auto'
    }
}))

const RemoveButton = (props: Omit<ButtonProps, 'onClick'>) => {
    const classes = useStyles();
    return (
        <Button label="" {...props} classes={classes}>
            <CloseIcon />
        </Button>
    );
};

export default RemoveButton;