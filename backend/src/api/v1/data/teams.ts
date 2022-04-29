import { ITeam } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

/**
 * A group of users that are working on a project together.
 */
export class Team extends DBManager<ITeam> {
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

    // Updates user assignments
    protected override async prepareDocumentForUpload(
        user: AuthUser,
        files: any,
        doc: ITeam,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        lastDBId: string
    ): Promise<ITeam> {
        let t = await super.prepareDocumentForUpload(
            user,
            files,
            doc,
            exists,
            map,
            lastDBId
        )

        // If there are no users, shortcut
        if (!t.users || t.users.length === 0) {
            return t
        }

        let teamId = this.db.asId(t.id as string)

        if (exists) {
            let currentUser = await this.db.getOneField<string[]>(
                teamId,
                'users'
            )
            let currentUserSet = new Set(currentUser)
            // New users
            let updateUser = <string[]>t.users
            let updateUserSet = new Set(<string[]>t.users)

            /** Users that need to be removed from this team */
            let oldUsers = currentUser.filter((t) => !updateUserSet.has(t))
            // Remove self from old teams
            if (oldUsers.length !== 0) {
                await UserManager.db.removeFromFieldArray(
                    oldUsers,
                    'teams',
                    teamId
                )
            }

            /** Users that need to be added to this team */
            let newUsers = updateUser.filter((t) => !currentUserSet.has(t))
            // Update the new users
            if (newUsers.length !== 0) {
                await UserManager.db.unionManyField(newUsers, 'teams', [teamId])
            }
        } else {
            // Update the users
            await UserManager.db.unionManyField(<string[]>t.users, 'teams', [
                teamId,
            ])
        }

        return t
    }

    // Unassign users from the team
    public override async delete(user: AuthUser, id: string): Promise<void> {
        // Retrieve list of users
        let users = await this.db.getOneField<string[]>(id, 'users')

        if (users && users.length !== 0) {
            // Remove the users from this team
            await UserManager.db.removeFromFieldArray(users, 'teams', id)
        }

        // Pass to super
        return super.delete(user, id)
    }
}

export const TeamManager = new Team()
