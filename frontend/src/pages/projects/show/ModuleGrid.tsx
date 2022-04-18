import { Accordion, AccordionSummary, Typography, AccordionDetails, Tabs, Box, Tab } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetList, useShowContext, Datagrid, TextField, ReferenceArrayField, DateField, BooleanField } from "react-admin";
import { useEffect, useState } from "react";
import { IModuleStep, IModule, IProject } from "src/util/types";

export type ModuleGridProps = {

}

const ModuleGrid = (props: ModuleGridProps) => {

    return (
        <>
            <Datagrid
                bulkActionButtons={false}
                expandSingle
                expand={<Box></Box>}
            >
                <TextField source="title" />
                <DateField source="suspense" locales="en-GB" />
                <TextField source="status" />
                <TextField source="currentStep" />
            </Datagrid>
        </>
    )
}

export default ModuleGrid;