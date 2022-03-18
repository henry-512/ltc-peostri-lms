import { AnyObject } from "react-final-form";
import { IUser } from "src/util/types";

export default function validateUser(user: IUser) {
    const errors: any = {};



    // Note: Module and Task Validation is done directly on the components input fields.

    return errors
}

export const validatePasswords = ({
    password,
    confirm_password,
}: AnyObject) => {
    const errors = {} as any;

    if (password && confirm_password && password !== confirm_password) {
        errors.confirm_password = [
            'resources.customers.errors.password_mismatch',
        ];
    }

    return errors;
};