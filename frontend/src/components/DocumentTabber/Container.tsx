/**
* @file Accordion container used on the document tabber on the module view page.
* @module Container
* @category DocumentTabber
* @author Braden Cariaga
*/

import { Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export type ContainerProps = {
    id: string
    title?: string
    startOpen: boolean
    children: JSX.Element
}

/**
 * Accordion container used on the document tabber on the module view page.
 * @param {ContainerProps} props 
 * @returns 
 */
const Container = ({ title = "Old Files", ...props }: ContainerProps) => (
    <Accordion sx={{
        width: '100%'
    }} defaultExpanded={props.startOpen} disableGutters>
        <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={props.id}
            id={props.id + "-header"}
            sx={{
                minHeight: '0px',
                '&.Mui-expanded': {
                    minHeight: '0px',
                    borderBottom: (theme) => '1px solid '+theme.palette.borderColor?.main
                },
                '& .MuiAccordionSummary-content': {
                    minHeight: '0px',
                    margin: '.65rem 0'
                },
                '& .MuiAccordionSummary-content.Mui-expanded': {
                    minHeight: '0px',
                    margin: '.65rem 0'
                }
            }}
        >
            <Typography>{`${title}`}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{
            padding: '0'
        }}>
            {props.children}
        </AccordionDetails>
    </Accordion>
)
export default Container