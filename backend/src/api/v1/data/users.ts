import bcrypt from 'bcrypt'
import { HTTPStatus } from '../../../lms/errors'
import { IUser } from '../../../lms/types'
import { isDBKey } from '../../../lms/util'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { RankManager } from './ranks'
import { UserArangoWrapper } from './UserArangoWrapper'

export const DB_NAME = 'users'

class User extends DBManager<IUser> {
    public async getUser(id: string): Promise<IUser> {
        if (id && isDBKey(id) && this.exists(id)) {
            return this.db.get(id)
        }
        throw this.error(
            'getUser',
            HTTPStatus.BAD_REQUEST,
            'Invalid user id',
            `${id} not a valid id`
        )
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
}

export const UserManager = new User()
