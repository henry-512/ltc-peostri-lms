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

    // Dereferences the usergroup ID and name
    protected override getAllQuery(
        sort: ISortOpts,
        offset: number,
        count: number,
        filters: IFilterOpts[],
        justIds: boolean,
        raw: boolean
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${this.collection}`

        for (const filter of filters) {
            let k =
                filter.key === 'name'
                    ? aql`CONCAT(z.firstName, ' ', z.lastName)`
                    : filter.ref
                    ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
                    : aql`z.${filter.key}`

            if (filter.inArray) {
                query = aql`${query} FILTER ${filter.inArray} IN ${k}`
            }
            if (filter.eq !== undefined) {
                query = aql`${query} FILTER ${k} == ${filter.eq}`
            }
            if (filter.in !== undefined) {
                query = aql`${query} FILTER ${k} IN ${filter.in}`
            }
            if (filter.q !== undefined) {
                query = aql`${query} FILTER REGEX_TEST(${k},${filter.q},true)`
            }
        }

        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        query = aql`${query} ${
            sort.desc ? 'DESC' : 'ASC'
        } LIMIT ${offset}, ${count} LET a = (RETURN DOCUMENT(z.rank))[0] RETURN`

        if (justIds) {
            query = aql`${query} z._id`
        } else if (raw) {
            query = aql`${query} z`
        } else {
            query = aql`${query} {rank:(RETURN {id:a._key,name:a.name})[0],${this.getAllQueryFields}}`
        }

        return query
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
