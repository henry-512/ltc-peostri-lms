import { IUserGroup } from "../../lms/types";
import { ApiRoute } from "./route";

class UserGroupRoute extends ApiRoute<IUserGroup> { 
    constructor() {
        super(
            'userGroups',
            'User Group',
            {
                'name':{type:'string',default:'New User Group'},
                'permissions':{
                    type:'object',default:{
                        'perm1':false,
                        'perm2':false,
                        'perm3':false
                    },
                    hideGetRef:true
                }
            },
            false,
            {},
            null
        )
    }
}

export const UserGroupRouteInstance = new UserGroupRoute()
