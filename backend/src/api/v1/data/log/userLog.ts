import { IUserLog } from '../../../../lms/types'
import { DBManager } from '../../DBManager'
import { SenderManager } from '../notifications'

class UserLog extends DBManager<IUserLog> {
    constructor() {
        super('userLogs', 'User Logs', {
            content: {
                type: 'string',
            },
            sender: {
                type: 'data',
                dataManager: SenderManager,
            },
            project: {
                type: 'fkey',
                managerName: 'projects',
                optional: true,
            },
            module: {
                type: 'fkey',
                managerName: 'modules',
                optional: true,
            },
            task: {
                type: 'fkey',
                managerName: 'tasks',
                optional: true,
            },
        })
    }
}
export const UserLogManager = new UserLog()
