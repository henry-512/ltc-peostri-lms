import { Datagrid, DateField, ReferenceArrayField, ReferenceField, TextField, useShowContext } from "react-admin";
import { useEffect, useState } from "react";
import { ITaskStep } from "src/util/types";
import StepTabber from "src/components/StepTabber";
import statusRowStyle from "src/util/statusRowStyle";
import AvatarGroupField from "src/components/AvatarGroupField";

const TabbedTaskList = () => {
    const {
        record
    } = useShowContext();

    const currentTasks = (record.currentStep !== "-1") ? { [`key-${record.currentStep}`]: record.tasks[`key-${record.currentStep}`] } : {} as ITaskStep
    const upcomingTasks = (() => {
        let steps = {} as ITaskStep;
        if (record.currentStep === "-1") return steps

        for (let i = record.currentStep + 1; i < Object.keys(record.tasks).length; i++) {
            steps[`key-${i}`] = record.tasks[`key-${i}`];
        }
        return steps;
    })()
    const completedTasks = (() => {
        let steps = {} as ITaskStep;
        let starter = record.currentStep
        
        if (starter === '-1') starter = Object.keys(record.tasks).length

        for (let i = starter - 1; i >= 0; i--) {
            steps[`key-${i}`] = record.tasks[`key-${i}`];
        }
        return steps;
    })()

    useEffect(() => {}, [record]);

    const [tab, setTab] = useState<number>(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setTab(newValue);
    };

    const tabOptions = [];
    if (currentTasks && Object.keys(currentTasks).length > 0) tabOptions.push({ name: 'Current', content: currentTasks });
    if (upcomingTasks && Object.keys(upcomingTasks).length > 0) tabOptions.push({ name: 'Upcoming', content: upcomingTasks });
    if (completedTasks && Object.keys(completedTasks).length > 0)  tabOptions.push({ name: 'Completed', content: completedTasks });

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

export default TabbedTaskList;