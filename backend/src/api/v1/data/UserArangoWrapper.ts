import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { ArangoCollectionWrapper, IFilterOpts } from '../../../database'
import { HTTPStatus } from '../../../lms/errors'
import { IFieldData } from '../../../lms/FieldData'
import { IUser } from '../../../lms/types'
import { DB_NAME } from './users'

export class UserArangoWrapper extends ArangoCollectionWrapper<IUser> {
    constructor(fields: [string, IFieldData][]) {
        super(DB_NAME, fields)
    }

    // 'name' concats first and last names
    protected override getAllBuildFilterKey(filter: IFilterOpts): GeneratedAqlQuery {
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

    public async getFromUsername(username: string) {
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
