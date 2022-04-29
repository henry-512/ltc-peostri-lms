/**
* @file Accordion step holder used for displaying the specific step item.
* @module StepContainer
* @category StepTabber
* @author Braden Cariaga
*/

import { Accordion, AccordionSummary, Typography, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ReferenceArrayField } from "react-admin";
import { IModule } from "src/util/types";

export type StepContainerProps = {
    step: IModule[]
    id: string
    startOpen: boolean
    children: JSX.Element
    reference: 'tasks' | 'modules'
}

const StepContainer = (props: StepContainerProps) => (
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
            <Typography>{`Step ${parseInt((props.id).split('-')[1]) + 1}`}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{
            padding: '0'
        }}>
            <ReferenceArrayField record={{id: props.step}} label=" " reference={props.reference} source="id">
                {props.children}
            </ReferenceArrayField>
        </AccordionDetails>
    </Accordion>
)
export default StepContainer