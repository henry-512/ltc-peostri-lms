import { EditActionsProps, ShowButton, CloneButton, TopToolbar } from "react-admin";

const TemplateEditToolbar = ({ data, resource }: EditActionsProps) => (
    <TopToolbar>
        <ShowButton record={data} />
        <CloneButton record={data} />
    </TopToolbar>
)

export default TemplateEditToolbar;