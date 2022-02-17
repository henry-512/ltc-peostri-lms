import { Box, Typography } from "@material-ui/core"
import { MouseEventHandler } from "react";
import { Button, SaveButton, Toolbar, ToolbarProps, useFormGroup, useTranslate } from "react-admin"
import { useForm } from "react-final-form";

export interface StepToolbarProps extends ToolbarProps {
     active: number;
     stepCount: number;
     optional: boolean;
     handleNext: MouseEventHandler;
     handleBack: MouseEventHandler;
     handleSkip: MouseEventHandler;
     backText: string;
     validator: string;
}

export default function StepToolbar(props: StepToolbarProps) {
     const translate = useTranslate();
     const formGroupState = useFormGroup(props.validator);
     const form = useForm();
     const formState = form.getState();

     const submitForm = (e: any): Promise<Object> => {
          e.preventDefault();

          return Promise.resolve({});
     }

     return (
          <Toolbar {...props}>
               <Button
                    color="inherit"
                    disabled={props.active === 0}
                    onClick={props.handleBack}
                    label={translate('layout.button.back')}
               />
               {
                    (props?.backText != "") ? (
                         <Typography variant="caption">
                              {props.backText}
                         </Typography>
                    ) : (
                         <></>
                    )
               }
               <Box sx={{ flex: '1 1 auto' }} />
               {props.optional && (
                    <Button color="inherit" onClick={props.handleSkip}
                    label={translate('layout.button.skip')} />
               )}
               {(props.active !== props.stepCount - 1) ?(
                    <Button onClick={props.handleNext} label={translate('layout.button.next')} disabled={formGroupState.invalid && formGroupState.dirty ? true : false} />
               ):( 
                    <SaveButton
                         label="layout.button.create"
                         redirect="show"
                         disabled={formState.invalid ? true : false}
                         handleSubmit={submitForm}
                    />
               )}
          </Toolbar>
     )
}