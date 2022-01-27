import { Box } from "@material-ui/core"
import { MouseEventHandler } from "react";
import { Button, SaveButton, Toolbar, ToolbarProps, useTranslate } from "react-admin"

export interface StepToolbarProps extends ToolbarProps {
     active: number;
     stepCount: number;
     optional: boolean;
     handleNext: MouseEventHandler;
     handleBack: MouseEventHandler;
     handleSkip: MouseEventHandler;
}

export default function StepToolbar(props: StepToolbarProps) {
     const translate = useTranslate();
     return (
          <Toolbar {...props} >
               <Button
                    color="inherit"
                    disabled={props.active === 0}
                    onClick={props.handleBack}
                    label={translate('layout.button.back')}
               />
               <Box sx={{ flex: '1 1 auto' }} />
               {props.optional && (
                    <Button color="inherit" onClick={props.handleSkip} 
                    label={translate('layout.button.skip')} />
               )}
               {(props.active !== props.stepCount - 1) ?(
                    <Button onClick={props.handleNext} label={translate('layout.button.next')} />
               ):( 
                    <SaveButton
                         label="layout.button.create"
                         redirect="show"
                         submitOnEnter={true}
                    />
               )}
          </Toolbar>
     )
}