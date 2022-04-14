import { Box } from "@mui/material";
import { FunctionField, ReferenceField, Show, SimpleShowLayout, TextField } from "react-admin";
import { SectionTitle } from "src/components/misc";
import getProgressStatus from "src/util/getProgressStatus";
import Aside from "./Aside";

const ProjectShow = (props: any) => {

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