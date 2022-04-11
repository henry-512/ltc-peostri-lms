import { Box } from "@material-ui/core";
import { FunctionField, FunctionFieldProps, ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import { SectionTitle, Separator } from "src/components";
import getProgressStatus from "src/util/getProgressStatus";
import { IProject } from "src/util/types";
import Aside from "./Aside";

const ProjectShow = (props: any) => {
    console.log(props);

    return (
        <Show {...props} aside={<Aside />} title={"Viewing Project: " + props.id}>
            <SimpleShowLayout>
                <Box display="flex" justifyContent="space-between">
                    <TextField source="title" variant="h4" gutterBottom />
                    <ReferenceField source="team" reference="admin/teams">
                        <TextField source="team" variant="h5" gutterBottom />
                    </ReferenceField>
                </Box>
                <Box display="flex" style={{ gap: '1rem' }} alignItems="center" >
                    <Box display="flex" width="calc(50% - .5rem)" justifyContent="space-between">
                        <Box display="flex" flexDirection="column">
                            <SectionTitle label="Status:" />
                            <TextField source="status" />
                        </Box>
                        <Box display="flex" flexDirection="column">
                            <SectionTitle label="Progress:" />
                            <FunctionField render={(record: any) => `${getProgressStatus(record.suspense)}`} />
                        </Box>
                    </Box>
                    <Box display="flex" width="calc(50% - .5rem)">
                        <SectionTitle label="Members" />
                    </Box>
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;