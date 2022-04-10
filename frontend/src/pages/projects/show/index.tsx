import { Box } from "@material-ui/core";
import { Show, SimpleShowLayout, TextField } from "react-admin";
import { Separator } from "src/components";
import Aside from "./Aside";

const ProjectShow = (props: any) => {
    console.log(props);

    return (
        <Show {...props} aside={<Aside />} title={"Viewing Project: " + props.id}>
            <SimpleShowLayout>
                <Box display="flex">
                    <TextField source="title" variant="h6" gutterBottom />
                    <Separator />
                    <TextField source="team" variant="h6" gutterBottom />
                </Box>
            </SimpleShowLayout>
        </Show>
    )
};

export default ProjectShow;