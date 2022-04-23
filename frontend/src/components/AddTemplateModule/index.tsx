/**
 * This is the doc comment for file1.ts
 *
 * Specify this is a module comment and rename it to my-module:
 * @module AddTemplateModule
 */

import { MouseEventHandler } from "react";
import { useTranslate } from "react-admin";
import AddTemplateModuleButton from "./AddTemplateModuleButton";
import AddTemplateModuleDialog from "./AddTemplateModuleDialog";

export type AddTemplateModuleProps = {
    openTemplate: MouseEventHandler
    templateSelectorOpen: boolean
    setTemplateSelectorOpen: Function
    cancelTemplate: Function
    submitTemplate: Function
    getNewSource: Function
    isTemplate?: boolean
    calculateTTC?: Function
    updateComponent: Function
}

const AddTemplateModule = (props: AddTemplateModuleProps) => {
    const {
        openTemplate,
        templateSelectorOpen,
        setTemplateSelectorOpen,
        cancelTemplate,
        submitTemplate,
        getNewSource,
        isTemplate,
        calculateTTC,
        updateComponent
    } = props;


    const translate = useTranslate();

    return (
        <>
            <AddTemplateModuleButton label="project.layout.add_module_template_button" onClick={openTemplate} />
            <AddTemplateModuleDialog
                ariaLabel='module_template_selection'
                label={translate('project.layout.add_module_template')}
                open={templateSelectorOpen}
                setOpen={setTemplateSelectorOpen}
                cancelAction={cancelTemplate}
                submitAction={submitTemplate}
                getSource={getNewSource}
                isTemplate={isTemplate}
                calculateTTC={calculateTTC}
                updateComponent={updateComponent}
            />
        </>
    )
}

export default AddTemplateModule;