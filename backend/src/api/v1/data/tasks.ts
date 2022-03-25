import { ITask } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { RankManager } from './ranks'
import { UserManager } from './users'

export const TaskManager = new DBManager<ITask>('tasks', 'Task', 'title', {
    title: { type: 'string' },
    status: {
        type: 'string',
        default: 'AWAITING',
    },
    users: {
        type: 'array',
        instance: 'fkey',
        default: [],
        getIdKeepAsRef: true,
        foreignApi: UserManager,
    },
    suspense: {
        type: 'string',
        optional: true,
    },
    rank: {
        type: 'fkey',
        optional: true,
        getIdKeepAsRef: true,
        foreignApi: RankManager,
    },
    module: {
        type: 'parent',
        parentReferenceKey: 'tasks',
    },
    type: { type: 'string' },
    ttc: {
        type: 'number',
        optional: true,
        hideGetAll: true,
    },
})
