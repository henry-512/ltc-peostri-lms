import { ParsedUrlQuery } from 'querystring'
import { IQueryGetOpts } from '../../../database'
import { INotification } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Notification extends DBManager<INotification> {
    constructor() {
        super(
            'notifications',
            'Notification',
            {
                recipient: {
                    type: 'fkey',
                    foreignApi: UserManager,
                },
                content: {
                    type: 'string',
                },
                sender: {
                    type: 'string',
                },
                read: {
                    type: 'boolean',
                    default: false,
                },
            },
            {
                hasCreate: true,
            }
        )
    }

    // public async buildNotification()

    public async readAllForUser(id: string) {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            },
            filters: [{ key: 'recipient', eq: id }],
            justIds: true,
        }

        let query = await this.db.queryGet(opts)

        let all = await query.cursor.all()

        for (const i of all) {
            if (await this.db.exists(i)) {
                await this.read(i)
            } else {
                this.internal('readAllForUser', `${i} is not a db id`)
            }
        }
    }

    public async read(id: string) {
        let doc = await this.db.get(id)

        doc.read = true

        return this.db.update(doc, {
            mergeObjects: false,
        })
    }

    public async getNotificationsAssignedToUser(
        userId: string,
        q: ParsedUrlQuery
    ) {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'recipient',
            eq: userId,
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

    public async getNumNotificationsAssignedToUser(userId: string, q: any) {
        let opts = this.parseQuery(q)
        opts.filters = opts.filters.concat({
            key: 'recipient',
            eq: userId,
        })

        return this.db.queryGetCount(opts)
    }
}

export const NotificationManager = new Notification()
