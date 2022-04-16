import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { ArangoWrapper, IFilterOpts, ISortOpts } from '../../../database'
import { HTTPStatus } from '../../../lms/errors'
import { IField } from '../../../lms/FieldData'
import { IUser } from '../../../lms/types'
import { DB_NAME } from './users'

export class UserArangoWrapper extends ArangoWrapper<IUser> {
    constructor(fields: [string, IField][]) {
        super(DB_NAME, fields)
    }

    // 'name' concats first and last names
    protected override getFilterKey(filter: IFilterOpts): GeneratedAqlQuery {
        return filter.key === 'name'
            ? aql`CONCAT(z.firstName, ' ', z.lastName)`
            : super.getFilterKey(filter)
    }

    // Modify return query to resolve user rank
    protected override returnQuery(
        query: GeneratedAqlQuery
    ): GeneratedAqlQuery {
        return aql`${query} LET a = (RETURN DOCUMENT(z.rank))[0] RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${this.getAllQueryFields}}`
    }

    public async getFromUsername(username: string) {
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}password:z.password}`

        let cursor = await ArangoWrapper.db.query(query)

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
