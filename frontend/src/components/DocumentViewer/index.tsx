/**
* @file Document Viewer Dialog
* @module DocumentViewer
* @category DocumentViewer
* @author Braden Cariaga
*/

import { Form, SaveButton, useTranslate } from "react-admin";
import { Breakpoint, styled } from '@mui/material/styles';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { cloneElement } from "react";
import React from "react";
import { FieldValues } from "react-hook-form";
import CloseIcon from '@mui/icons-material/Close';

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiPaper-root': {
        height: '100vh'
    },
    '& .MuiDialogTitle-root': {
        margin: 0,
        padding: theme.spacing(2),
        borderBottom: '1px solid ' + theme.palette.borderColor?.main,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    '& .MuiDialogContent-root': {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        paddingTop: theme.spacing(1) + " !important",
        paddingBottom: theme.spacing(1)
    },
    '& .MuiDialogActions-root': {
        margin: 0,
        padding: theme.spacing(2),
        borderTop: '1px solid ' + theme.palette.borderColor?.main,
        display: 'flex',
        justifyContent: 'flex-end'
    }
}));

export type DocumentViewerProps = {
    open: boolean
    handleClose: () => void
    ariaLabel: string
    label: string
    maxWidth?: Breakpoint
    src: string
    actions?: JSX.Element | JSX.Element[]
}

/**
 * Dialog document viewer. This returns a dialog and opens a document by its src prop in an iframe.
 */
const DocumentViewer = (props: DocumentViewerProps) => {
    const translate = useTranslate();

    console.log(props.src)

    return (
        <>
            <StyledDialog open={props.open} onClose={props.handleClose} aria-labelledby={props.ariaLabel} fullWidth={true} maxWidth={(props.maxWidth ? props.maxWidth : 'sm')}>
                <DialogTitle id={props.ariaLabel}>
                    <Typography variant="h6" sx={{ margin: 0, padding: 0 }}>{props.label}</Typography>
                    <Button onClick={props.handleClose} size="small" sx={{ minWidth: 0, margin: 0, padding: '.1rem' }} color="error" >
                        <CloseIcon fontSize="small" />
                    </Button>
                </DialogTitle>
                <DialogContent>
                    <iframe src={props.src} height="100%" width="100%"></iframe>
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.handleClose} color="error">
                        {translate('ra.action.close')}
                    </Button>
                    {(props.actions) ? <Box sx={{ flex: '1 1 auto' }} /> : null}
                    {(props.actions) ? 
                        React.Children.map(props.actions, (child, index) => {
                            return React.cloneElement(child, {
                                key: `dialog-actions-${index}`
                            })
                        })
                    : null}
                </DialogActions>
            </StyledDialog>
        </>
    )
}

export default DocumentViewer;