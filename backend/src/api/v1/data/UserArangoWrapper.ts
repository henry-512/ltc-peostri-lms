import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { ArangoWrapper, db, ISortOpts, IFilterOpts } from "../../../database";
import { IUser } from "../../../lms/types";
import { HTTPStatus } from "../../../lms/errors";
import { IFieldData } from "../../../lms/FieldData";
import { DB_NAME } from "./users";

export class UserArangoWrapper extends ArangoWrapper<IUser> {
    constructor(
        fields: [string, IFieldData][]
    ) {
        super(DB_NAME, fields);
    }

    // Dereferences the usergroup ID and name
    protected override getAllQuery(
        sort: ISortOpts,
        offset: number, 
        count: number,
        filters: IFilterOpts[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z IN ${this.collection}`

        for (const filter of filters) {
            let k = filter.ref
                ? aql`DOCUMENT(z.${filter.key}).${filter.ref}`
                : aql`z.${filter.key}`

            if (filter.in) {
                query = aql`${query} FILTER ${k} IN ${filter.in}`
            }

            if (filter.q) {
                query = aql`${query} FILTER CONTAINS(${k},${filter.q})`
            }
        }

        query = sort.ref
            ? aql`${query} SORT DOCUMENT(z.${sort.key}).${sort.ref}`
            : aql`${query} SORT z.${sort.key}`

        query = aql`${query} ${sort.desc ? aql`DESC` : aql`ASC`}
            LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.rank))[0]
            RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${this.getAllQueryFields}}`

        return query
    }

    public async getFromUsername(username: string) {
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}password:z.password}`;

        let cursor = await db.query(query);

        if (!cursor.hasNext) {
            throw this.error(
                'getFromUsername',
                HTTPStatus.BAD_REQUEST,
                'Login information invalid',
                `Username ${username} not found`
            );
        }

        let usr = await cursor.next();
        if (cursor.hasNext) {
            throw this.internal(
                'getFromUsername',
                `Multiple users with the same username [${username}]`
            )
        }
        return usr;
    }
}
