import { Typography } from "@material-ui/core";

const TaskLabel = (props: any) => (
     <Typography variant="h6" className={props.classes.taskTitle}>
          {props.title}
     </Typography>
)

export default TaskLabel;