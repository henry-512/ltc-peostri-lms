import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { ArangoCollectionWrapper, IFilterOpts } from '../../../database'
import { HTTPStatus } from '../../../lms/errors'
import { IFieldData } from '../../../lms/FieldData'
import { IUser } from '../../../lms/types'
import { USER_DB_NAME } from './users'

/**
 * Special ArangoWrapper for users. Allows for filtering on full names and
 * dereferences user ranks on GET-ALL queries.
 */
export class UserArangoWrapper extends ArangoCollectionWrapper<IUser> {
    constructor(fields: [string, IFieldData][]) {
        super(USER_DB_NAME, fields)
    }

    // 'name' concats first and last names for comparison
    protected override getAllBuildFilterKey(
        filter: IFilterOpts
    ): GeneratedAqlQuery {
        return filter.key === 'name'
            ? aql`CONCAT(z.firstName, ' ', z.lastName)`
            : super.getAllBuildFilterKey(filter)
    }

    // Modify return query to resolve user rank
    protected override getAllReturnQuery(
        query: GeneratedAqlQuery
    ): GeneratedAqlQuery {
        return aql`${query} LET a = DOCUMENT(z.rank) RETURN {rank:{id:a._key,name:a.name},${this.getAllQueryFields}}`
    }

    /**
     * Retrieves a user from their username. Runs during the authentication
     * process. Returns the same fields as a getAll query, alongside the user's
     * hashed password.
     *
     * @param username The username to retrieve
     * @return A user with the passed username
     */
    public async getFromUsername(username: string): Promise<IUser> {
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}password:z.password}`

        let cursor = await ArangoCollectionWrapper.DatabaseInstance.query(query)

        if (!cursor.hasNext) {
            throw this.error(
                'getFromUsername',
                HTTPStatus.BAD_REQUEST,
                'Login information invalid',
                `Username ${username} not found`
            )
        }

        let usr = await cursor.next()
        if (cursor.hasNext) {
            throw this.internal(
                'getFromUsername',
                `Multiple users with the same username [${username}]`
            )
        }
        return usr
    }
}
