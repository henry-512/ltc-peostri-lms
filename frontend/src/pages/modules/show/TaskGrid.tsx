import { Accordion, AccordionSummary, Typography, AccordionDetails, Tabs, Box, Tab } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useGetList, useShowContext, Datagrid, TextField, ReferenceArrayField, DateField, ReferenceField } from "react-admin";
import { useEffect, useState } from "react";
import { IModuleStep, IModule, IProject } from "src/util/types";
import statusRowStyle from "src/util/statusRowStyle";
import AvatarGroupField from "src/components/users/AvatarGroupField";

export type TaskGridProps = {

}

const TaskGrid = (props: TaskGridProps) => {

    return (
        <>
            <Datagrid
                bulkActionButtons={false}
                rowStyle={statusRowStyle}
            >
                <TextField source="type" />
                <TextField source="title" />
                <DateField source="suspense" locales="en-GB" />
                <TextField source="status" />
                <ReferenceField source="rank" reference="admin/ranks">
                    <TextField source="name" />
                </ReferenceField>
                <ReferenceArrayField reference="admin/users" source="users">
                    <AvatarGroupField height={24} width={24} fontSize="14px" max={6} color='blue' />
                </ReferenceArrayField>
            </Datagrid>
        </>
    )
}

export default TaskGrid;