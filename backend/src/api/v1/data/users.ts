import bcrypt from 'bcrypt'
import { IUser } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DataManager } from '../DataManager'
import { DBManager } from '../DBManager'
import { TeamManager } from './teams'
import { UserArangoWrapper } from './UserArangoWrapper'

export const DB_NAME = 'users'

class User extends DBManager<IUser> {
    constructor() {
        super(
            DB_NAME,
            'User',
            {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                avatar: { type: 'string', default: 'google.com' },
                rank: {
                    type: 'fkey',
                    managerName: 'ranks',
                    getIdKeepAsRef: true,
                    acceptNewDoc: false,
                },
                teams: {
                    type: 'array',
                    instance: 'fkey',
                    managerName: 'teams',
                    acceptNewDoc: false,
                    optional: true,
                    getIdKeepAsRef: true,
                    default: [],
                },
                status: {
                    type: 'string',
                    default: 'ACTIVE',
                },
                email: {
                    type: 'string',
                    optional: true,
                },
                // Auth data
                username: {
                    type: 'string',
                    hideGetRef: true,
                },
                password: {
                    type: 'string',
                    hideGetAll: true,
                    hideGetId: true,
                    hideGetRef: true,
                    preserveWhitespace: true,
                },
                firstVisited: {
                    type: 'string',
                    optional: true,
                },
                lastVisited: {
                    type: 'string',
                    optional: true,
                },
                name: {
                    type: 'string',
                    dummy: true,
                },
            },
            {
                // This has custom functionality in UserArangoWrapper
                defaultFilter: 'name',
            }
        )

        this.db = new UserArangoWrapper(this.fieldEntries)
    }

    protected override async verifyAddedDocument(
        user: AuthUser,
        files: any,
        doc: IUser,
        exists: boolean,
        map: Map<DataManager<any>, any[]>,
        lastDBId: string
    ): Promise<IUser> {
        let u = await super.verifyAddedDocument(
            user,
            files,
            doc,
            exists,
            map,
            lastDBId
        )

        // If teams are set, update the user's teams
        if (!u.teams || u.teams.length === 0) {
            return u
        }

        let userId = this.db.asId(u.id as string)

        if (exists) {
            let currentTeam = await this.db.getOneField<string[]>(
                userId,
                'teams'
            )
            let currentTeamSet = new Set(currentTeam)
            // New teams
            let updateTeam = <string[]>u.teams
            let updateTeamSet = new Set(<string[]>u.teams)

            /** Teams that this user needs to be removed from */
            let oldTeams = currentTeam.filter((t) => !updateTeamSet.has(t))
            // Remove self from old teams
            if (oldTeams.length !== 0) {
                await TeamManager.db.removeFromFieldArray(
                    oldTeams,
                    'users',
                    userId
                )
            }

            /** Teams that this user needs to be added to */
            let newTeams = updateTeam.filter((t) => !currentTeamSet.has(t))
            // Update the new teams
            if (newTeams.length !== 0) {
                await TeamManager.db.unionManyField(newTeams, 'users', [userId])
            }
        } else {
            // Update the teams
            await TeamManager.db.unionManyField(<string[]>u.teams, 'users', [
                userId,
            ])
        }

        return u
    }

    public override async delete(
        user: AuthUser,
        id: string,
        real: boolean,
        base: boolean
    ): Promise<void> {
        // Retrieve list of teams
        let teams = await this.db.getOneField<string[]>(id, 'teams')

        // Remove this user from the teams
        await TeamManager.db.removeFromFieldArray(teams, 'users', id)

        // Pass to super
        return super.delete(user, id, real, base)
    }

    protected override modifyDoc = async (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IUser> => {
        // Hash password
        if (doc.password) {
            doc.password = await bcrypt.hash(doc.password, 5)
        }
        return doc
    }

    public async getFromUsername(username: string) {
        return (<UserArangoWrapper>this.db).getFromUsername(username)
    }

    // Update the first/lastVisited fields
    public async updateForNewLogin(key: string) {
        let id = this.db.keyToId(key)
        let user = await this.db.get(id)

        if (!user.firstVisited) {
            user.firstVisited = new Date().toJSON()
        }
        user.lastVisited = new Date().toJSON()

        return this.db.update(user)
    }
}

export const UserManager = new User()
