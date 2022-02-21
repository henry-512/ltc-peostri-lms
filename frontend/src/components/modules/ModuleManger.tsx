import { useEffect, useState } from "react";
import { FormSpy, useForm, useFormState } from "react-final-form";
import { IModule, IModuleStep } from "src/util/types";
import Steps from "../steps";
import ModuleCard from "./ModuleCard";
import Creator from "./Creator";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { useTranslate } from "react-admin";
import ModuleFields from "./ModuleFields";

type ModuleManagerProps = {
     initialValue?: IModuleStep;
}

const ModuleManager = (props: ModuleManagerProps) => {
     const translate = useTranslate();
     const form = useForm();
     const formData = form.getState().values;
     const [creatorOpen, setCreatorOpen] = useState(false);
     const [modules, setModules] = useState(formData.modules || {} as IModuleStep);
     const [curKey, setCurKey] = useState(Object.keys(modules).length);
     const [newSource, setNewSource] = useState(`modules[key-${curKey}][0]`);

     useFormState({
          subscription: {
               values: true
          },
          onChange: ({values}) => {
               setModules(values.modules || {});
          }
     })

     //Initialize Modules on Form.
     useEffect(() => {
          form.change('modules', modules);
     }, []);

     useEffect(() => {}, [modules])

     const openCreator = () => {
          form.change('modules', {
               ...modules,
               [`key-${curKey}`]: [{} as IModule]
          });
          setCreatorOpen(true);

          setNewSource(`modules[key-${curKey}][0]`);
     }

     const cancelCreator = () => {
          let cacheModules = modules;
          delete cacheModules[`key-${curKey}`];
          form.change('modules', cacheModules);
     }

     const submitCreator = () => {
          setCurKey(Object.keys(formData.modules || {}).length);
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
                    fixKey={setCurKey}
                    renderData={modules}
                    emptyText={translate('project.layout.no_modules')}
               >
                    <ModuleCard fixKey={setCurKey} />
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
                    <ModuleFields getSource={getNewSource} />
               </Creator>
          </>
     )
}

export default ModuleManager;