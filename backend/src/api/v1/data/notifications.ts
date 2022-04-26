import {
    INotification,
    ISender,
    ResourceTypeConverter,
} from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Sender extends DataManager<ISender> {
    constructor() {
        super('Sender', {
            display: {
                type: 'string',
            },
            resource: {
                type: 'string',
            },
            id: {
                type: 'string',
            },
        })
    }
}

export const SenderManager = new Sender()

class Notification extends DBManager<INotification> {
    constructor() {
        super(
            'notifications',
            'Notification',
            {
                recipient: {
                    type: 'fkey',
                    managerName: 'users',
                },
                content: {
                    type: 'string',
                },
                sender: {
                    type: 'data',
                    foreignData: SenderManager,
                },
                type: {
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

    public async sendNotification(
        recipient: string,
        content: string,
        sender: ISender
    ) {
        // Validate user key
        await UserManager.db.assertIdExists(recipient)

        let notification: INotification = {
            id: this.db.generateDBID(),
            recipient,
            sender,
            content,
            createdAt: new Date().toJSON(),
            read: false,
            type: ResourceTypeConverter[sender.resource],
        }

        return this.db.save(notification)
    }

    public async sendToMultipleUsers(
        recipients: string[],
        content: string,
        sender: ISender
    ) {
        for (const r of recipients) {
            await this.sendNotification(r, content, sender)
        }
    }

    public async readAllForUser(userId: string) {
        return this.db.updateWithFilterFaster('recipient', userId, 'read', true)
    }

    public async read(id: string) {
        return this.db.updateOneFaster(id, 'read', true)
    }
}

export const NotificationManager = new Notification()
