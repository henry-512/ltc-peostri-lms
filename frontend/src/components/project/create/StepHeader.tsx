import { Step, StepLabel, Stepper, Typography } from "@material-ui/core";
import React from "react";
import { StepSettings } from "./Step";

export type StepHeaderProps  = {
     active: number
     children: JSX.Element | JSX.Element[];
     setStepOptional: (index: number) => void;
     isStepSkipped: (index: number) => boolean;
}

type LabelProps = {
     optional: JSX.Element
}

type StepProps = {
     completed: boolean
}

export default function StepHeader(props: StepHeaderProps) {

     return (
          <Stepper activeStep={props.active} {...props}>
               {(React.Children.map(props.children, (element, index) => {
                    if (!React.isValidElement(element)) return;
                    const labelProps: LabelProps = {} as LabelProps;
                    const stepProps: StepProps = {} as StepProps;

                    const elProps: StepSettings = element.props as StepSettings;

                    if (elProps.optional) {
                         props.setStepOptional(index);
                         labelProps.optional = (
                              <Typography variant="caption">Optional</Typography>
                         );
                    }

                    if (props.isStepSkipped(index)) {
                         stepProps.completed = false;
                    }

                    return (
                         <Step key={elProps.title} {...stepProps} >
                              <StepLabel {...labelProps}>{elProps.title}</StepLabel>
                         </Step>
                    );
               }))}
          </Stepper>
     )
}