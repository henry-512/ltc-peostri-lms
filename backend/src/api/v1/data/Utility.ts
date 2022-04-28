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
    let userTeams = await UserManager.db.getOneField<string[]>(userId, 'teams')
    let usersOnTeam = await TeamManager.db.getOneField<string[]>(
        teamId,
        'users'
    )

    userTeams = userTeams.concat(teamId)
    usersOnTeam = usersOnTeam.concat(userId)

    await UserManager.db.updateFaster(userId, 'teams', userTeams)
    await TeamManager.db.updateFaster(teamId, 'users', usersOnTeam)
}
