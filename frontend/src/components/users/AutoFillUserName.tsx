import { useEffect } from "react";
import { TextInput } from "react-admin";
import { useForm, useFormState } from "react-final-form";

export type AutoFillUserNameProps = {
    validate: any;
    className: any;
}

const AutoFillUserName = (props: AutoFillUserNameProps) => {
    const form = useForm();
    const { values } = useFormState();

    useEffect(() => {
        if (values.email === values.username) {
            form.change('useEmail', true);
        }
    }, []);

    useEffect(() => {
        if (values.useEmail) {
            form.change('username', values.email);
        } else {
            form.change('username', values.username || "");
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