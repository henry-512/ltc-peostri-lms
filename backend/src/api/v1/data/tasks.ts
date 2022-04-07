import { IGetAllQueryResults } from '../../../database'
import { ITask } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { RankManager } from './ranks'
import { UserManager } from './users'

class Task extends DBManager<ITask> {
    constructor() {
        super('tasks', 'Task', 'title', {
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
            },
        })
    }

    public async getTasksAssignedToUser(
        userId: string,
        q: any
    ): Promise<IGetAllQueryResults> {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'users',
            inArray: userId,
        })

        let query = await this.db.queryGet(opts)

        let all = await query.cursor.all()

        await Promise.all(all.map(async (doc) => this.convertIDtoKEY(doc)))

        return {
            all,
            size: query.size,
            low: opts.range.offset,
            high: opts.range.offset + Math.min(query.size, opts.range.count),
        }
    }

    public async getNumTasksAssignedToUser(userId: string, q: any) {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'users',
            inArray: userId,
        })

        return this.db.queryGetCount(opts)
    }
}

export const TaskManager = new Task()
