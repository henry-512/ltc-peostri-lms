import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useFormState } from "react-final-form";
import { IModule, IModuleStep } from "src/util/types";
import Steps from "../StepBuilder";
import ModuleCard from "./ModuleCard";
import Creator from "./Creator";
import { useTranslate } from "react-admin";
import ModuleFields from "./ModuleFields";
import AddTemplateModuleButton from "./AddNewTemplateModuleButton";
import AddTemplateModuleDialog from "./AddNewTemplateModuleDialog";
import React from "react";

export type ModuleManagerProps = {
    initialValue?: IModuleStep;
    isTemplate?: boolean;
    fields?: JSX.Element;
    calculateTTC?: Function
}
/**
 * @name ModuleManager
 * @description ModuleManager Component1
 * @param props 
 * @returns Module Manager Component
 */
const ModuleManager = (props: ModuleManagerProps) => {
    const translate = useTranslate();
    const form = useForm();

    //Dialogs open
    const [creatorOpen, setCreatorOpen] = useState(false);
    const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

    //Main Modules Data
    const [modules, setModules] = useState(form.getState().values.modules || {
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

    const updateComponent = () => {
        setModules(form.getState().values.modules);
    }

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
        form.change('modules', {
            ...modules,
            [`key-${step}`]: stepArray
        });

        // Open the creator window.
        setCreatorOpen(true);
    }

    /**
     * @name cancelCreator
     * @description Cancel the creator by removing the empty module structure created.
     */
    const cancelCreator = () => {
        let cacheModules = modules;

        if (!cacheModules[`key-${step}`]) return;

        cacheModules[`key-${step}`].pop();

        form.change('modules', cacheModules);

        updateComponent();
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
        form.change('modules', {
            ...modules,
            [`key-${step}`]: stepArray
        });

        // Open the template selector window.
        setTemplateSelectorOpen(true);
    }

    /**
     * @name cancelTemplate
     * @description Cancel the template selection by removing the empty module structure created.
     */
    const cancelTemplate = () => {
        let cacheModules = modules;

        if (!cacheModules[`key-${step}`]) return;
        cacheModules[`key-${step}`].pop();

        form.change('modules', cacheModules);

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
            <Steps
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
                    <AddTemplateModuleButton label="project.layout.add_module_template_button" onClick={openTemplate} />,
                    <AddTemplateModuleDialog
                        ariaLabel='module_template_selection'
                        label={translate('project.layout.add_module_template')}
                        open={templateSelectorOpen}
                        setOpen={setTemplateSelectorOpen}
                        cancelAction={cancelTemplate}
                        submitAction={submitTemplate}
                        getSource={getNewSource}
                        isTemplate={props.isTemplate}
                        calculateTTC={props.calculateTTC}
                        updateComponent={updateComponent}
                    />
                ]}
            >
                <ModuleCard changeStep={setStep} changeIndex={setIndex} updateComponent={updateComponent} fields={props.fields} calculateTTC={props.calculateTTC} />
            </Steps>
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
    return <></>
}

export default ModuleManager;