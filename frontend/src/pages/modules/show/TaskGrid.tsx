import { Accordion, AccordionSummary, Typography, AccordionDetails, Tabs, Box, Tab } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetList, useShowContext, Datagrid, TextField, ReferenceArrayField, DateField, BooleanField } from "react-admin";
import { useEffect, useState } from "react";
import { IModuleStep, IModule, IProject } from "src/util/types";

export type TaskGridProps = {

}

const TaskGrid = (props: TaskGridProps) => {

    return (
        <>
            <Datagrid
                bulkActionButtons={false}
            >
                <TextField source="title" />
                <DateField source="suspense" locales="en-GB" />
                <TextField source="status" />
                <TextField source="currentStep" />
            </Datagrid>
        </>
    )
}

export default TaskGrid;