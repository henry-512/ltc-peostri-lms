import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
import { IUser } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserGroupRouteInstance } from "./userGroup";

class UserRoute extends ApiRoute<IUser> {
    constructor() {
        super(
            'users',
            'User',
            {
                'firstName': {type:'string'},
                'lastName':{type:'string'},
                'avatar':{type:'string'},
                'userGroup':{type:'fkey'},
            },
            false,
            {
                'userGroup': UserGroupRouteInstance
            },
            null
        )
    }
    // Override
    // Dereferences the usergroup ID and name
    override getAllQuery(
        collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
        queryFields: GeneratedAqlQuery,
        filterIds: string[]
    ): GeneratedAqlQuery {
        let query = aql`FOR z in ${collection} SORT z.${sort} ${sortDir}`

        if (filterIds.length > 0) {
            query = aql`${query} FILTER z._key IN ${filterIds}`
        }

        return aql`${query} LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.userGroup))[0]
            RETURN {userGroup:(RETURN {id:a._key,name:a.name})[0],${queryFields}}`
    }
}

export const UserRouteInstance = new UserRoute()
