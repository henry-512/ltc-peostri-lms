import { IRank } from "../../lms/types";
import { isDBId } from "../../lms/util";
import { ApiRoute } from "./route";

class RankRoute extends ApiRoute<IRank> {
    public async getRank(id: string): Promise<IRank> {
        if (id && isDBId(id) && this.exists(id)) {
            return this.getUnsafe(id)
        }
        throw new TypeError(`${id} not a valid key`)
    }

    constructor() {
        super(
            'ranks',
            'ranks',
            'Rank',
            {
                'name':{type:'string',default:'New Rank'},
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
        )
    }
}

export const RankRouteInstance = new RankRoute()
