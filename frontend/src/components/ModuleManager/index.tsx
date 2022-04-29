/**
* @file Main module manager file. This component is used on the project and module editing as the main module setup.
* @module ModuleManager
* @category ModuleManager
* @author Braden Cariaga
*/

import { useMemo, useState } from "react";
import { IModule, IModuleStep } from "src/util/types";
import ModuleCard from "./ModuleCard";
import { useTranslate } from "react-admin";
import ModuleFields from "./ModuleFields";
import React from "react";
import AddTemplateModule from "../AddTemplateModule";
import { useFormContext } from "react-hook-form";
import Creator from "../Creator";
import StepBuilder from "../StepBuilder";

export type ModuleManagerProps = {
    defaultValue?: IModuleStep;
    isTemplate?: boolean;
    fields?: JSX.Element;
    calculateTTC?: Function;
}
/**
 * @name ModuleManager
 * @param props 
 */
const ModuleManager = (props: ModuleManagerProps) => {
    const { getValues, setValue } = useFormContext();

    const translate = useTranslate();

    //Dialogs open
    const [creatorOpen, setCreatorOpen] = useState(false);
    const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

    //Main Modules Data
    const [modules, setModules] = useState(getValues('modules') || {
        "key-0": []
    } as IModuleStep);

    /**
     * @name calculateStep
     * @description Helper function to quickly calculate the current step based on modules data.
     * @returns Current Step Key
     */
    const calculateStep = () => {
        return (modules) ? (Object.keys(modules).length - 1) : 0
    }

    /**
     * @name calculateIndex
     * @description Helper function to quickly calculate the next Index based on modules data.
     * @returns Next Index
     */
    const calculateIndex = () => {
        return (modules[`key-${step}`] && modules[`key-${step}`].length > 0) ? (modules[`key-${step}`].length) : 0
    }

    const updateComponent = () => setModules({...getValues('modules')});

    //Current Step Key
    const [step, setStep] = useState(() => calculateStep());
    //Current Index on Step
    const [index, setIndex] = useState(() => calculateIndex());

    const newSource = useMemo(() => `modules[key-${step}][${index}]`, [step, index]);

    /**
     * @name openCreator
     * @description Opens the creator window to add a new module.
     */
    const openCreator = () => {
        if (!modules[`key-${step}`]) return;
        setIndex(calculateIndex());

        // Create empty module structure on this step.
        let stepArray = modules[`key-${step}`];
        stepArray.push({} as IModule);

        // Update form with blank step added.
        setValue(`modules.key-${step}`, stepArray);

        // Open the creator window.
        setCreatorOpen(true);
    }

    /**
     * @name cancelCreator
     * @description Cancel the creator by removing the empty module structure created.
     */
    const cancelCreator = () => {
        if (!modules[`key-${step}`]) return;

        let stepArray = modules[`key-${step}`]
        stepArray.pop();

        setValue(`modules.key-${step}`, stepArray);
    }

    /**
     * @name submitCreator
     * @description Submit method for the creator. Increments the index.
     */
    const submitCreator = () => {
        updateComponent();
    }

    /**
     * @name openTemplate
     * @description Opens the template selection window to add a new module.
     */
    const openTemplate = () => {
        if (!modules[`key-${step}`]) return;
        setIndex(calculateIndex());

        // Create empty module structure on this step.
        let stepArray: IModule[] = modules[`key-${step}`];
        stepArray.push({} as IModule);

        // Update form with blank step added.
        setValue(`modules.key-${step}`, stepArray);

        // Open the template selector window.
        setTemplateSelectorOpen(true);
    }

    /**
     * @name cancelTemplate
     * @description Cancel the template selection by removing the empty module structure created.
     */
    const cancelTemplate = () => {
        if (!modules[`key-${step}`]) return;

        let stepArray = modules[`key-${step}`]
        stepArray.pop();

        setValue(`modules.key-${step}`, stepArray);

        updateComponent();
    }

    /**
     * @name submitTemplate
     * @description Submit method for the template selection. Increments the index.
     */
    const submitTemplate = () => {
        updateComponent();
    }

    const getNewSource = (key: string) => {
        if (key) return `${newSource}.${key}`.toString();
        return newSource.toString();
    }

    return (
        <>
            <StepBuilder
                title={translate('project.layout.module_title')}
                help={translate('project.layout.order_modules_help')}
                save="modules"
                changeOnAction={true}
                createLabel="project.layout.create_module"
                createAction={openCreator}
                changeStep={setStep}
                changeIndex={setIndex}
                updateComponent={updateComponent}
                renderData={modules}
                emptyText={translate('project.layout.no_modules')}
                actions={[
                    <AddTemplateModule
                        openTemplate={openTemplate}
                        templateSelectorOpen={templateSelectorOpen}
                        setTemplateSelectorOpen={setTemplateSelectorOpen}
                        cancelTemplate={cancelTemplate}
                        submitTemplate={submitTemplate}
                        getNewSource={getNewSource}
                        isTemplate={props.isTemplate}
                        calculateTTC={props.calculateTTC}
                        updateComponent={updateComponent}
                    />
                ]}
            >
                <ModuleCard changeStep={setStep} changeIndex={setIndex} updateComponent={updateComponent} fields={props.fields} calculateTTC={props.calculateTTC} />
            </StepBuilder>
            <Creator
                label={translate('project.layout.create_module')}
                open={creatorOpen}
                setOpen={setCreatorOpen}
                ariaLabel="module-creator"
                cancelAction={cancelCreator}
                submitAction={submitCreator}
                create
            >
                {(props.fields) ? React.cloneElement(props.fields, { getSource: getNewSource }) : <ModuleFields getSource={getNewSource} calculateTTC={props.calculateTTC} />}
            </Creator>
        </>
    )
}

export default ModuleManager;