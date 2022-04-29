/**
* @file Administration User transformer method.
* @module AdministrationUserTransformerMethod
* @category AdministrationUserPage
* @author Braden Cariaga
*/

import { IUser } from "src/util/types";
import cloneDeep from 'lodash.clonedeep';

const transformer = (userData: IUser) => {
    let data = cloneDeep(userData);
    /* Deleting the `useEmail` property from the `data` object. */
    delete data.useEmail;
    /* Deleting the `confirm_password` property from the `data` object. */
    delete data.confirm_password;

    /* If the `password` property is present in the `data` object and the length of the `password`
    property is less than 1, then delete the `password` property from the `data` object. */
    if (data.password && data.password.length < 1) {
        delete data.password;
    }

    return {
        ...data
    }
}

export default transformer;