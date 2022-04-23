import { useEffect } from "react";
import { TextInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export type AutoFillUserNameProps = {
    validate: any;
    className: any;
}

const AutoFillUserName = (props: AutoFillUserNameProps) => {
    const { setValue } = useFormContext();
    
    const [email, useEmail, username] = useWatch({ name: ["email", "useEmail", "username"] });

    useEffect(() => {
        if (email === username) {
            setValue('useEmail', true);
        }
    }, []);

    useEffect(() => {
        if (useEmail) {
            setValue('username', email);
        } else {
            setValue('username', username || "");
        }
    }, [useEmail, email]);

    return (
        <>
            <TextInput
                source="username"
                className={props.className}
                validate={props.validate}
                value={
                    (useEmail) ? email : ""
                }
                disabled={
                    (useEmail) ? true : false
                }
                helperText=" "
            />
        </>
    )
}

export default AutoFillUserName;