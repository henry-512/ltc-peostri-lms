import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
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
        collection: DocumentCollection,
        sort: GeneratedAqlQuery,
        sortDir: GeneratedAqlQuery,
        offset: number,
        count: number,
        queryFields: GeneratedAqlQuery,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z in ${collection} SORT z.${sort} ${sortDir}`;

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`;
        }

        return aql`${query} LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.rank))[0]
            RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${queryFields}}`;
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
            throw this.error(
                'getFromUsername',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `Multiple users with the same username [${username}]`
            );
        }
        return usr;
    }
}
