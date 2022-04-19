import { Accordion, AccordionSummary, Typography, AccordionDetails, Tabs, Box, Tab, Divider } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetList, useShowContext, Datagrid, TextField, ReferenceArrayField, FunctionField } from "react-admin";
import { useEffect, useState } from "react";
import { IModuleStep, IModule, IProject } from "src/util/types";
import TaskGrid from './TaskGrid'

export type StepContainerProps = {
    step: IModule[]
    id: string
    startOpen: boolean
}

const StepContainer = (props: StepContainerProps) => (
    <Accordion sx={{
        width: '100%'
    }} defaultExpanded={props.startOpen}>
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
            <Typography>{`Step ${(props.id).split('-')[1]}`}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{
            padding: '2px'
        }}>
            <ReferenceArrayField record={{id: props.step}} label=" " reference="tasks" source="id">
                <TaskGrid />
            </ReferenceArrayField>
        </AccordionDetails>
    </Accordion>
)
export default StepContainer