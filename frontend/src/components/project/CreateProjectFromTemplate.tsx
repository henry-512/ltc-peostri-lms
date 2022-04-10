import { useState } from "react";
import { SimpleForm, useTranslate } from "react-admin";
import CreateProjectFromTemplateButton from "./CreateProjectFromTemplateButton";
import CreateProjectFromTemplateDialog from "./CreateProjectFromTemplateDialog";

export interface CreateProjectFromTemplateProps {
    variant?: 'contained' | 'outlined' | 'text'
}

const CreateProjectFromTemplate = (props: CreateProjectFromTemplateProps) => {
    const translate = useTranslate();
    const [dialogOpen, setDialogOpen] = useState(false);

    return (
        <>
            <CreateProjectFromTemplateButton label="project.create.from_template" onClick={() => setDialogOpen(true)} variant={(props.variant) ? props.variant : undefined} />
            <SimpleForm 
                hidden
                toolbar={<></>}
            >
                <CreateProjectFromTemplateDialog ariaLabel={"project_template_selection"} label={translate("project.layout.select_template")} open={dialogOpen} setOpen={setDialogOpen} />
            </SimpleForm>
        </>
    )
}

export default CreateProjectFromTemplate;