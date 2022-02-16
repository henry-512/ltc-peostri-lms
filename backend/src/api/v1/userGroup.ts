import { IUserGroup } from "../../lms/types";
import { ApiRoute } from "./route";

class UserGroupRoute extends ApiRoute<IUserGroup> { 
    constructor() {
        super(
            'userGroups',
            'User Group',
            ['name', 'permissions'],

            // [
            //     {key:'name',},
            //     {'permissions'}
            // ],
            false,
            [],
            null,
            null
        )
    }
}

export const UserGroupRouteInstance = new UserGroupRoute()
