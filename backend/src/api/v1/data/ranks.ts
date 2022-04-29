import { defaultPermissions, IPermission, IRank } from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'

/** Manages permissions for ranks. */
export const PermissionManager = new DataManager<IPermission>('Permission', {
    taskFetching: { type: 'string' },
    projectFetching: { type: 'string' },
    moduleFetching: { type: 'string' },
    verboseLogging: { type: 'boolean' },
})

/** Manages user ranks. */
export const RankManager = new DBManager<IRank>(
    'ranks',
    'Rank',
    {
        name: { type: 'string', default: 'New Rank' },
        permissions: {
            type: 'data',
            default: defaultPermissions,
            dataManager: PermissionManager,
            hideGetRef: true,
        },
    },
    { defaultFilter: 'name' }
)
