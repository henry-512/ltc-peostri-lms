import { IUserGroup } from "../../lms/types";
import { isDBId } from "../../lms/util";
import { ApiRoute } from "./route";

class UserGroupRoute extends ApiRoute<IUserGroup> {
    public async getGroup(id: string): Promise<IUserGroup> {
        if (id && isDBId(id) && this.exists(id)) {
            return this.getUnsafe(id)
        }
        throw new TypeError(`${id} not a valid key`)
    }

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
