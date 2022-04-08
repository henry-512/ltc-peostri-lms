import { INotification } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Notification extends DBManager<INotification> {
    constructor() {
        super('notifications', 'Notification', 'recipient', {
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
        })
    }

    public async read(ids: string[]) {
        for (const id of ids) {
            let doc = await this.db.get(id)

            doc.read = true

            await this.db.update(doc, {
                mergeObjects: false,
            })
        }
    }
}

export const NotificationManager = new Notification()
