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
            ['firstName', 'lastName', 'avatar', 'userGroup'],

            // [
            //     {key:'firstName',default:'',scope:'public'},
            //     {key:'lastName',default:'',scope:'public'},
            //     {key:'avatar',default:'',scope:'public'},
            //     {key:'userGroup',default:'userGroup/',scope:'private'}
            // ],
            false,
            [
                {key:'userGroup',class:UserGroupRouteInstance,optional:false}
            ],
            null,
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
        queryFields: GeneratedAqlQuery
    ): GeneratedAqlQuery {
        return aql`
            FOR z in ${collection}
            SORT z.${sort} ${sortDir}
            LIMIT ${offset}, ${count}
            LET a = (RETURN DOCUMENT(z.userGroup))[0]
            RETURN {userGroup:(RETURN {id:a._id,name:a.name})[0],${queryFields}}`
    }
}

export const UserRouteInstance = new UserRoute()
