import { ITeam } from '../../../lms/types'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Team extends DBManager<ITeam> {
    constructor() {
        super('teams', 'Team', 'recipient', {
            users: {
                type: 'array',
                instance: 'fkey',
                foreignApi: UserManager,
                default: [],
                getIdKeepAsRef: true,
            },
            name: {
                type: 'string',
            },
        })
    }
}

export const TeamManager = new Team()
