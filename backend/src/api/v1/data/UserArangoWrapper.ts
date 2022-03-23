import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { ArangoWrapper, db } from "../../../database";
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
        sort: GeneratedAqlQuery,
        sortDir: GeneratedAqlQuery,
        offset: number,
        count: number,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z in ${this.collection} SORT z.${sort} ${sortDir}`;

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`;
        }

        return aql`${query} LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.rank))[0]
            RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${this.getAllQueryFields}}`;
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
