import { IPermission, IRank } from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'

const PermissionManager = new DataManager<IPermission>('Permission', {
    perm1: { type: 'boolean' },
    perm2: { type: 'boolean' },
    perm3: { type: 'boolean' },
})

export const RankManager = new DBManager<IRank>(
    'ranks',
    'Rank',
    {
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
    },
    { defaultFilter: 'name' }
)
