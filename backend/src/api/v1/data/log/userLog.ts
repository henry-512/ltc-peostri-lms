import { IUserLog } from '../../../../lms/types'
import { DBManager } from '../../DBManager'
import { ModuleManager } from '../modules'
import { SenderManager } from '../notifications'
import { ProjectManager } from '../projects'
import { TaskManager } from '../tasks'

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
                foreignApi: ProjectManager,
                optional: true,
            },
            module: {
                type: 'fkey',
                foreignApi: ModuleManager,
                optional: true,
            },
            task: {
                type: 'fkey',
                foreignApi: TaskManager,
                optional: true,
            },
        })
    }
}
export const UserLogManager = new UserLog()
