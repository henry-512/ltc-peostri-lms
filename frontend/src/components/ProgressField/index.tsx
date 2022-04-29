/**
* @file Linear progress bar with percentage.
* @module ProgressField
* @category ProgressField
* @author Braden Cariaga
*/

import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * A function that takes in props and returns a box with a linear progress bar and a percentage. 
 * @param {LinearProgressProps & { value: number }} props - LinearProgressProps & { value: number }
 */
function ProgressField(props: LinearProgressProps & { value: number }) {
    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
                <LinearProgress variant="determinate" {...props} />
            </Box>
            <Box sx={{ minWidth: 35 }}>
                <Typography variant="body2" color="text.secondary">{`${Math.round(
                    props.value
                )}%`}</Typography>
            </Box>
        </Box>
    );
}
  
export default ProgressField;