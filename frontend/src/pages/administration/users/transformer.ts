import { IUser } from "src/util/types";

const transformer = (data: IUser) => {
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