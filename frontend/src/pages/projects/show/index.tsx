import { Box } from "@material-ui/core";
import { FunctionField, FunctionFieldProps, ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import { Separator } from "src/components";
import getProgressStatus from "src/util/getProgressStatus";
import { IProject } from "src/util/types";
import Aside from "./Aside";

const ProjectShow = (props: any) => {
    console.log(props);

    return (
        <Show {...props} aside={<Aside />} title={"Viewing Project: " + props.id}>
            <SimpleShowLayout>
                <Box display="flex" justifyContent="space-between">
                    <TextField source="title" variant="h6" gutterBottom />
                    <ReferenceField source="team" reference="admin/teams">
                        <TextField source="team" variant="h4" gutterBottom />
                    </ReferenceField>
                </Box>
                <Box>
                    <TextField source="status" />
                    
                    <FunctionField render={(record: any) => `${getProgressStatus(record.suspense)}`} />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;