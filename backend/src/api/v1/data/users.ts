import bcrypt from 'bcrypt'
import { IUser } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { RankManager } from './ranks'
import { UserArangoWrapper } from './UserArangoWrapper'

export const DB_NAME = 'users'

class User extends DBManager<IUser> {
    public async getUser(id: string): Promise<IUser> {
        return this.db.get(id)
    }

    constructor() {
        super(
            DB_NAME,
            'User',
            {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                avatar: { type: 'string' },
                rank: {
                    type: 'fkey',
                    getIdKeepAsRef: true,
                    foreignApi: RankManager,
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
                },
                firstVisited: {
                    type: 'string',
                    optional: true,
                },
                lastVisited: {
                    type: 'string',
                    optional: true,
                },
            },
            {
                defaultFilter: { key: 'name' },
            }
        )

        this.db = new UserArangoWrapper(this.fieldEntries)
    }

    override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IUser> {
        // Hash password
        if (doc.password) {
            doc.password = await bcrypt.hash(doc.password, 5)
        }
        return doc
    }

    // Update the first/lastVisited fields
    public async updateForNewLogin(id: string) {

    }
}

export const UserManager = new User()
