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
                foreignData: SenderManager,
            },
            project: {
                type: 'fkey',
                // foreignApi: ProjectManager,
                managerName: 'projects',
                optional: true,
            },
            module: {
                type: 'fkey',
                // foreignApi: ModuleManager,
                managerName: 'modules',
                optional: true,
            },
            task: {
                type: 'fkey',
                // foreignApi: TaskManager,
                managerName: 'tasks',
                optional: true,
            },
        })
    }
}
export const UserLogManager = new UserLog()
