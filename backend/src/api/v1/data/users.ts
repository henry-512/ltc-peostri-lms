import Router from "@koa/router";
import { aql, GeneratedAqlQuery } from "arangojs/aql";
import { DocumentCollection } from "arangojs/collection";
import bcrypt from 'bcrypt'

import { db } from "../../../database";
import { IUser } from "../../../lms/types";
import { ApiRoute } from "../route";
import { RankRouteInstance } from "./ranks";
import { isDBKey } from "../../../lms/util";
import { HTTPStatus } from "../../../lms/errors";
import { AuthUser } from "../../auth";

class UserRoute extends ApiRoute<IUser> {
    public async getUser(key: string): Promise<IUser> {
        if (key && isDBKey(key) && this.exists(key)) {
            return this.getUnsafe(key)
        }
        throw this.error(
            'getUser',
            HTTPStatus.BAD_REQUEST,
            'Invalid user key',
            `${key} not a valid key`
        )
    }

    constructor() {
        super(
            'users',
            'users',
            'User',
            {
                'firstName': {type:'string'},
                'lastName':{type:'string'},
                'avatar':{type:'string'},
                'rank':{
                    type:'fkey',
                    getIdKeepAsRef:true,
                    foreignApi:RankRouteInstance,
                },
                'status':{
                    type:'string',
                    default:'ACTIVE',
                },
                'email':{
                    type:'string',
                    optional:true
                },

                'username':{
                    type:'string',
                    hideGetRef:true,
                },
                'password':{
                    type:'string',
                    hideGetAll:true,
                    hideGetId:true,
                    hideGetRef:true,
                }
            },
            false,
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
            LET a = (RETURN DOCUMENT(z.rank))[0]
            RETURN {rank:(RETURN {id:a._key,name:a.name})[0],${queryFields}}`
    }

    override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any,
        id: string,
    ) {
        // Hash password
        if (doc.password) {
            doc.password = await bcrypt.hash(doc.password, 5)
        }
        return doc
    }

    public async getFromUsername(username: string) {
        let query = aql`FOR z IN users FILTER z.username == ${username} RETURN {${this.getAllQueryFields}password:z.password}`

        let cursor = await db.query(query)

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
            throw this.error(
                'getFromUsername',
                HTTPStatus.INTERNAL_SERVER_ERROR,
                'Invalid system state',
                `Multiple users with the same username [${username}]`
            )
        }
        return usr
    }

    public override makeRouter() {
        let r = new Router({prefix:this.routeName})
        // Self
        r.get('/self', async (ctx, next) => {
            let user = await AuthUser.validate(ctx.cookies.get('token'))

            ctx.body = await this.getFromDB(user, 0, user.getId())
            ctx.status = HTTPStatus.OK
        })

        return super.makeRouter(r)
    }
}

export const UserRouteInstance = new UserRoute()
