/**
* @file Administration Team transformer method.
* @module AdministrationTeamsTransformerMethod
* @category AdministrationTeamsPage
* @author Braden Cariaga
*/

import { ITeam } from "src/util/types";

const transformer = (data: ITeam) => {

    return {
        ...data
    }
}

export default transformer;