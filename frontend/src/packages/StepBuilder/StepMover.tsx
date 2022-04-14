import { makeStyles } from "@material-ui/core";
import StepDownButton from "./StepDownButton";
import StepUpButton from "./StepUpButton";

const useStyles = makeStyles(theme => ({
     stepMover: {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
     }
}))

const StepMover = ({up, down, topEdge, botEdge}: {up: any, down: any, topEdge: boolean, botEdge: boolean}) => {
     const classes = useStyles();
     return (
          <div className={classes.stepMover}>
               <StepDownButton label="" onClick={down} disabled={(botEdge ? true : false)}/>
               <StepUpButton label="" onClick={up}  disabled={(topEdge ? true : false)}/>
          </div>
     )
}

export default StepMover;