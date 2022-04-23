/**
* @file User form field component for auto filling the username based on email and the `useEmail` input.
* @module AutoFillUserName
* @category AutoFillUserName
* @author Braden Cariaga
*/

import { useEffect } from "react";
import { TextInput } from "react-admin";
import { useFormContext, useWatch } from "react-hook-form";

export type AutoFillUserNameProps = {
    validate: any;
    className: any;
}

/**
 * "If the user checks the checkbox, then the username field is disabled and the email field is used as
 * the username. If the user unchecks the checkbox, then the username field is enabled and the user can
 * enter a username."
 * 
 * I'm using the useFormContext hook to get the setValue function. I'm using the useWatch hook to get
 * the values of the email, useEmail, and username fields.
 * 
 * I'm using the useEffect hook to set the useEmail field to true if the email field is the same as the
 * username field.
 * 
 * I'm using the useEffect hook to set the username field to the email field if the useEmail field is
 * true. If the useEmail field is false, then the username field is set to the username field.
 * 
 * @param {AutoFillUserNameProps} props
 */
const AutoFillUserName = (props: AutoFillUserNameProps) => {
    const { setValue } = useFormContext();
    
    /* It's getting the values of the email, useEmail, and username fields. */
    const [email, useEmail, username] = useWatch({ name: ["email", "useEmail", "username"] });

    /* It's setting the useEmail field to true if the email field is the same as the username field. */
    useEffect(() => {
        if (email === username) {
            setValue('useEmail', true);
        }
    }, []);

    /* It's setting the username field to the email field if the useEmail field is true. If the
    useEmail field is false, then the username field is set to the username field. */
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