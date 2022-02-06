import { IUserGroup } from "../../lms/types";
import { ApiRoute } from "./route";

class UserGroupRoute extends ApiRoute<IUserGroup> { 
    constructor() {
        super(
            'userGroups',
            'User Group',
            ['name', 'permissions'],
            false,
            [],
            null,
            []
        )
    }
}

export const UserGroupRouteInstance = new UserGroupRoute()
