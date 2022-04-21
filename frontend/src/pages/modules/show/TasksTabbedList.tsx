import { Datagrid, DateField, ReferenceArrayField, ReferenceField, TextField, useShowContext } from "react-admin";
import { useState } from "react";
import { ITaskStep } from "src/util/types";
import StepTabber from "src/packages/StepTabber";
import statusRowStyle from "src/util/statusRowStyle";
import AvatarGroupField from "src/components/users/AvatarGroupField";

const TasksTabbedList = () => {
    const {
        record
    } = useShowContext();

    const currentModules = { [`key-${record.currentStep}`]: record.tasks[`key-${record.currentStep}`] }
    const upcomingModules = (() => {
        let steps = {} as ITaskStep;
        for (let i = record.currentStep + 1; i < Object.keys(record.tasks).length; i++) {
            steps[`key-${i}`] = record.tasks[`key-${i}`];
        }
        return steps;
    })()
    const completedModules = (() => {
        let steps = {} as ITaskStep;
        for (let i = record.currentStep - 1; i >= 0; i--) {
            steps[`key-${i}`] = record.tasks[`key-${i}`];
        }
        return steps;
    })()

    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const tabOptions = [];
    if (currentModules && Object.keys(currentModules).length > 0) tabOptions.push({ name: 'Current', content: currentModules });
    if (upcomingModules && Object.keys(upcomingModules).length > 0) tabOptions.push({ name: 'Upcoming', content: upcomingModules });
    if (completedModules && Object.keys(completedModules).length > 0)  tabOptions.push({ name: 'Completed', content: completedModules });

    return (
        <>
            <StepTabber tab={tab} tabOptions={tabOptions} handleChange={handleChange} reference="tasks" >
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
            </StepTabber>
        </>
    )
}

export default TasksTabbedList;