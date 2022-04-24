import { TeamManager } from './teams'
import { UserArangoWrapper } from './UserArangoWrapper'
import { UserManager } from './users'

/**
 * Assigns a user to a team
 */
export async function assignUserToTeam(userId: string, teamId: string) {
    let user = await UserManager.db.get(userId)
    let team = await TeamManager.db.get(teamId)

    user.teams = (<string[]>user.teams).concat(teamId)
    team.users = (<string[]>team.users).concat(userId)

    await UserManager.db.update(user, { mergeObjects: false })
    await TeamManager.db.update(team, { mergeObjects: false })
}

/**
 *
 */
export async function syncUserToTeam(userId: string) {
    let userWrapper = UserManager.db as UserArangoWrapper
}
