import { ITeam } from "src/util/types";

const transformer = (data: ITeam) => {

    return {
        ...data
    }
}

export default transformer;