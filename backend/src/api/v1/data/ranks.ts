import { IPermission, IRank } from '../../../lms/types'
import { isDBId } from '../../../lms/util'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'

class Permission extends DataManager<IPermission> {
    constructor() {
        super('Permission', {
            perm1: { type: 'string' },
            perm2: { type: 'string' },
            perm3: { type: 'string' },
        })
    }
}
const PermissionManager = new Permission()

class Rank extends DBManager<IRank> {
    public async getRank(id: string): Promise<IRank> {
        return this.db.get(id)
    }

    constructor() {
        super('ranks', 'Rank', {
            name: { type: 'string', default: 'New Rank' },
            permissions: {
                type: 'data',
                default: {
                    perm1: false,
                    perm2: false,
                    perm3: false,
                },
                foreignData: PermissionManager,
                hideGetRef: true,
            },
        })
    }
}

export const RankManager = new Rank()
