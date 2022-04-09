import { ParsedUrlQuery } from 'querystring'
import { IQueryGetOpts } from '../../../database'
import { INotification, ISender, NotificationType, ResourceType } from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class NotificationSender extends DataManager<ISender> {
    constructor() {
        super('Sender', {
            resource: {
                type: 'string',
            },
            id: {
                type: 'string',
            }
        })
    }
}

const SenderManager = new NotificationSender()

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
                    type: 'data',
                    foreignData: SenderManager,
                },
                type: {
                    type: 'string'
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

    public buildType(t: ResourceType): NotificationType {
        switch(t) {
            case 'projects':
                return 'PROJECT'
            case 'users':
                return 'USER'
            case 'modules':
                return 'MODULE'
            case 'tasks':
                return 'TASK'
            default:
                throw this.internal(
                    'buildType',
                    `type ${t} is not valid`
                )
        }
    }

    public async buildAndSaveNotification(
        recipientKey: string,
        content: string,
        sender: ISender
    ) {
        // Validate and convert user key
        let recipient = await UserManager.db.assertKeyExists(recipientKey)

        let notification: INotification = {
            id: this.db.generateDBID(),
            recipient,
            sender,
            content,
            read: false,
            type: this.buildType(sender.resource)
        }

        return this.db.save(notification)
    }

    public async readAllForUser(id: string) {
        let opts: IQueryGetOpts = {
            range: {
                offset: 0,
                count: 10,
            },
            filters: [{ key: 'recipient', eq: id }],
            raw: true,
        }

        let query = await this.db.queryGet(opts)

        let all = await query.cursor.all()

        for (const doc of all) {
            // Hack the id to be a key
            doc.id = doc._key
            doc.read = true
            await this.db.update(doc, { mergeObjects: false })
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
