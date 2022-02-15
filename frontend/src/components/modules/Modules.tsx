import { useEffect, useState } from "react";
import { maxLength, minLength, required } from "react-admin";
import { useForm } from "react-final-form";
import { ModuleArrayInput } from ".";

const Modules = (props: any) => {
     const form = useForm();
     const formValue = form.getState().values

     const getInitialValues = () => {
          const formValues = form.getState().values;
          let values = formValues.modules;

          if (!formValues.modules || formValues.modules.length <= 0) {
               values = [
                    {tasks: [{}]}
               ]
          }

          form.change('modules', values);
     }

     useEffect(() => {
          getInitialValues();
     }, []);
     
     return (
          <>
               <ModuleArrayInput {...props} />
          </>
     )
}    

export default Modules;
