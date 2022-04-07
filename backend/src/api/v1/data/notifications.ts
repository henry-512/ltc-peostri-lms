import { ITeam } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Notification extends DBManager<ITeam> {
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
        })
    }
}

export const NotificationManager = new Notification()
