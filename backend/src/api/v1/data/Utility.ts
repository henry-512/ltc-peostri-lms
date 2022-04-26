import { AuthUser } from '../../auth'
import { TeamManager } from './teams'
import { UserManager } from './users'

/**
 * Assigns a user to a team
 */
export async function assignUserToTeam(
    user: AuthUser,
    userId: string,
    teamId: string
) {
    let userTeams = await UserManager.db.getOneFaster<string[]>(userId, 'teams')
    let usersOnTeam = await TeamManager.db.getOneFaster<string[]>(
        teamId,
        'users'
    )

    userTeams = userTeams.concat(teamId)
    usersOnTeam = usersOnTeam.concat(userId)

    await UserManager.db.updateOneFaster(userId, 'teams', userTeams)
    await TeamManager.db.updateOneFaster(teamId, 'users', usersOnTeam)
}
