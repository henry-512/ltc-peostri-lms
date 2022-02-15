import React, { useEffect } from "react";
import { SimpleForm, useFormGroup } from "react-admin"
import StepHeader from "./StepHeader";
import StepToolbar from "./StepToolbar"

export default function Stepper(props: any) {
     const [backText, setBackText] = React.useState("");
     const [activeStep, setActiveStep] = React.useState(0);
     const [skipped, setSkipped] = React.useState(new Set());
     const [validator, setValidator] = React.useState("");
     const optionalCache: number[] = [];

     const resetBackText = () => {
          setBackText("");
     }

     const isStepOptional = (step: number) => {
          return optionalCache.includes(step);
     };

     const setStepOptional = (step: number) => {
          optionalCache.push(step);
     }

     const isStepSkipped = (step: number) => {
          return skipped.has(step);
     };

     const handleNext = () => {
          resetBackText();
          let newSkipped = skipped;
          if (isStepSkipped(activeStep)) {
               newSkipped = new Set(newSkipped.values());
               newSkipped.delete(activeStep);
          }

          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setSkipped(newSkipped);
     };

     const handleBack = () => {
          resetBackText();
          setActiveStep((prevActiveStep) => prevActiveStep - 1);
     };

     const handleSkip = () => {
          if (!isStepOptional(activeStep)) {
               // You probably want to guard against something like this,
               // it should never occur unless someone's actively trying to break something.
               throw new Error("You can't skip a step that isn't optional.");
          }

          resetBackText();
          setActiveStep((prevActiveStep) => prevActiveStep + 1);
          setSkipped((prevSkipped) => {
               const newSkipped = new Set(prevSkipped.values());
               newSkipped.add(activeStep);
               return newSkipped;
          });
     };

     const handleReset = () => {
          setActiveStep(0);
          resetBackText();
     };

     return (
          <SimpleForm submitOnEnter={false} redirect="show" toolbar={
               <StepToolbar 
                    active={activeStep}
                    optional={isStepOptional(activeStep)}
                    stepCount={props.children.length}
                    handleBack={handleBack}
                    handleNext={handleNext}
                    handleSkip={handleSkip} 
                    backText={backText}   
                    validator={validator}            
               />
          } {...props} validation={props.validate}>
               <StepHeader 
                    active={activeStep}
                    children={props.children}
                    setStepOptional={setStepOptional}
                    isStepSkipped={isStepSkipped}
               />
               {React.cloneElement(props.children[activeStep], {
                    setValidator: setValidator,
                    setBackText: setBackText
               })}
          </SimpleForm>
     )
}