import { ITeam } from '../../../lms/types'
import { DBManager } from '../DBManager'

class Team extends DBManager<ITeam> {
    constructor() {
        super(
            'teams',
            'Team',
            {
                users: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'users',
                    default: [],
                    getIdKeepAsRef: true,
                },
                name: {
                    type: 'string',
                },
            },
            { defaultFilter: 'name' }
        )
    }
}

export const TeamManager = new Team()
