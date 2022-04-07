import { ITeam } from '../../../lms/types'
import { DBManager } from '../DBManager'

class Team extends DBManager<ITeam> {
    constructor() {
        super('teams', 'Team', 'recipient', {
            users: {
                type: 'array',
                instance: 'fkey',
                foreignApi: 'users' as any,
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
