/**
* @file Administration User validation method.
* @module AdministrationUserValidationMethod
* @category AdministrationUserPage
* @author Braden Cariaga
*/

import { FieldValues } from "react-hook-form";

export default function validateUser(user: FieldValues) {
    const errors: any = {};

    if (user.password && user.confirm_password && user.password !== user.confirm_password) {
        errors.confirm_password = [
            'resources.customers.errors.password_mismatch',
        ];
    }

    // Note: Module and Task Validation is done directly on the components input fields.

    return errors
}

export const validatePasswords = ({
    password,
    confirm_password,
}: FieldValues) => {
    const errors = {} as any;

    if (password && confirm_password && password !== confirm_password) {
        errors.confirm_password = [
            'resources.customers.errors.password_mismatch',
        ];
    }

    return errors;
};