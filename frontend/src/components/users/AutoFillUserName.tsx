import { useEffect, useState } from "react";
import { BooleanInput, TextInput } from "react-admin";
import { useForm, useFormState } from "react-final-form";

type Props = {
    validate: any;
    className: any;
}

const AutoFillUserName = (props: Props) => {
    const form = useForm();
    const { values } = useFormState();

    useEffect(() => {
        if (values.useEmail) {
            form.change('username', values.email);
        } else {
            form.change('username', "");
        }
    }, [values.useEmail, values.email]);

    return (
        <>
            <TextInput
                source="username"
                className={props.className}
                validate={props.validate}
                value={
                    (values.useEmail) ? values.email : ""
                }
                disabled={
                    (values.useEmail) ? true : false
                }
            />
        </>
    )
}

export default AutoFillUserName;