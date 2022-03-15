import { IUser } from "src/util/types";

const transformer = (data: any) => {
    delete data.useEmail;
    delete data.confirm_password;

    console.log(data);

    return {
        ...data
    }
}

export default transformer;