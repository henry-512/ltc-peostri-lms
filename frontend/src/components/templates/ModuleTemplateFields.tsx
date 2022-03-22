import { Box, Grid, makeStyles, Typography } from "@material-ui/core"
import IDField from "../modules/IDField";
import WaiverInput from "../modules/WaiverInput";
import classNames from "classnames";
import RichTextInput from "ra-input-rich-text";
import { FileField, FileInput, maxLength, minLength, required, SelectInput, TextInput, useTranslate } from "react-admin";
import { useState } from "react";
import TaskManager from "../modules/TaskManager";

const useStyles = makeStyles(theme => ({
    modulesForm: {
        marginTop: '0px'
    },
    modulesArrayInput: {
        marginTop: '10px'
    },
    waiverWrapper: {
        position: 'relative',
        height: '0px',
        transition: 'height 0.3s ease',
        overflow: 'hidden',
    },
    waiverWrapperOpen: {
        transition: 'height 0.3s ease',
        height: '190px',
        marginBottom: '-30px',
        maxHeight: 'unset'
    }
}))

type ModuleTemplateFieldsProps = {
    getSource: Function,
    initialValues?: any
}

const ModuleTemplateFields = (props: ModuleTemplateFieldsProps) => {
    const { getSource, initialValues } = props;
    const validateTitle = [required(), minLength(2), maxLength(150)];

    return (
        <>
            <Grid container spacing={2} style={{
                marginTop: '.1rem'
            }}>
                <IDField source={getSource('id') || ""} id={props.initialValues?.id} />
                <Grid item xs={5}>
                    <TextInput
                        source={getSource('title') || ""}
                        label="project.fields.module_title"
                        fullWidth
                        helperText=" "
                        validate={validateTitle}
                    />
                </Grid>

                <Grid item xs={4}>
                    <SelectInput
                        source={getSource('status') || ""}
                        choices={[
                            { id: 'AWAITING', name: 'AWAITING' },
                            { id: 'IN_PROGRESS', name: 'IN PROGRESS' },
                            { id: 'COMPLETED', name: 'COMPLETED' },
                            { id: 'WAIVED', name: 'WAIVED' },
                            { id: 'ARCHIVED', name: 'ARCHIVED' }
                        ]}
                        optionText={choice => `${choice.name}`}
                        optionValue="id"
                        disabled
                        initialValue="AWAITING"
                        label="project.fields.module_status"
                        fullWidth
                        helperText=" "
                    />
                </Grid>
            </Grid>
            <Grid container spacing={2} style={{
                marginTop: '.5rem'
            }}>
                <Grid item xs={12}>
                    <TaskManager source={getSource?.('tasks') || ""} />
                </Grid>
            </Grid>
        </>
    )
}

export default ModuleTemplateFields;