import { Step, StepLabel, Stepper, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import React from "react";
import { StepSettings } from "./Step";

const PREFIX = 'StepHeader';

const classes = {
    root: `${PREFIX}-root`
};

const StyledStepper = styled(Stepper)((
    {
        theme
    }
) => ({
    [`&.${classes.root}`]: {
        flexGrow: 1
    }
}));

export type StepHeaderProps = {
    active: number
    children: JSX.Element | JSX.Element[];
    setStepOptional: (index: number) => void;
    isStepSkipped: (index: number) => boolean;
}

export type LabelProps = {
    optional: JSX.Element
}

export type StepProps = {
    completed: boolean
}

export default function StepHeader(props: StepHeaderProps) {

    return (
        <StyledStepper activeStep={props.active} {...props} className={classes.root}>
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
        </StyledStepper>
    );
}