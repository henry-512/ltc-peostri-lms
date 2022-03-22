import { IRank } from "../../../lms/types";
import { isDBId } from "../../../lms/util";
import { DBManager } from "../DBManager";

class Rank extends DBManager<IRank> {
    public async getRank(id: string): Promise<IRank> {
        if (id && isDBId(id) && this.exists(id)) {
            return this.db.get(id)
        }
        throw new TypeError(`${id} not a valid key`)
    }

    constructor() {
        super(
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

export const RankManager = new Rank()
