import { IUser } from "src/util/types";
import cloneDeep from 'lodash.clonedeep';

const transformer = (userData: IUser) => {
    let data = cloneDeep(userData);
    delete data.useEmail;
    delete data.confirm_password;

    if (data.password && data.password.length < 1) {
        delete data.password;
    }

    return {
        ...data
    }
}

export default transformer;