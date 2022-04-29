import {
    INotification,
    ISender,
    ResourceTypeConverter,
} from '../../../lms/types'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

/** URL resource handler */
export class Sender extends DataManager<ISender> {
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

/** In-system notifications */
export class Notification extends DBManager<INotification> {
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
                    dataManager: SenderManager,
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

    /**
     * Send a notification to all passed users.
     *
     * @param recipients Array of user `ID`s to send the notification to
     * @param content The content of the notification
     * @param sender The resource that produced the notification
     */
    public async sendToMultipleUsers(
        recipients: string[],
        content: string,
        sender: ISender
    ) {
        for (const recipient of recipients) {
            // Validate user key
            await UserManager.db.assertIdExists(recipient)

            // Build
            let notification: INotification = {
                id: this.db.generateDBID(),
                recipient,
                sender,
                content,
                createdAt: new Date().toJSON(),
                read: false,
                type: ResourceTypeConverter[sender.resource],
            }

            // Save
            return this.db.save(notification)
        }
    }

    /** Reads all notifications for the user */
    public async readAllForUser(userId: string) {
        return this.db.updateFilterFaster('recipient', userId, 'read', true)
    }

    /** Reads a single notification from its `ID` */
    public async read(id: string) {
        return this.db.updateFaster(id, 'read', true)
    }
}

export const NotificationManager = new Notification()
