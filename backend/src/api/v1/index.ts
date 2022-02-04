import Router from '@koa/router'
import { aql, GeneratedAqlQuery } from 'arangojs/aql'
import { DocumentCollection } from 'arangojs/collection'
import koaBody from 'koa-body'
import { db } from '../../database'
import { IArangoIndexes, IComment, IModule, IProject, ITask, IUser, IUserGroup } from '../../lms/types'
import { generateDBKey } from '../../util'

import { ApiRoute } from './route'

export interface IRouterArgs {
	name: string
	dname: string
	all: string[]

	// Fields returned from getAll
	gaFields: string[]
	gaQuery?: (
		collection: DocumentCollection,
		sort: GeneratedAqlQuery,
		sortDir: GeneratedAqlQuery,
		offset: number, 
		count: number,
		queryFields: GeneratedAqlQuery) => GeneratedAqlQuery
	
	upload: (
		self:IRouterArgs,
		key:string,
		data: IArangoIndexes,
		par?: string) => Promise<IArangoIndexes>

	// Fields returned from getId
	cascade: {
		key: string
		class: IRouterArgs
	}[]
}

const UserGroupArgs: IRouterArgs = {
	name: 'userGroups',
	dname: 'User Group',
	all: ['name', 'permissions'],
	gaFields: ['name', 'permissions'],
	cascade: [],

	upload: async function (self: IRouterArgs, key: string, data: IArangoIndexes): Promise<IArangoIndexes> {
		delete data.id
		data._key = key

		let u = <IUserGroup>data
		return db.collection(self.name).save(u) as IArangoIndexes
	}
}

async function user(self: IRouterArgs, key: string, data: IArangoIndexes) {
	delete data.id
    data._key = key
	
	let u = <IUser>data
	if (typeof u.userGroup !== 'string') {
        throw new ReferenceError(`${u.userGroup} is invalid`)
    }

    return db.collection(self.name).save(u) as IArangoIndexes
}

const UserArgs: IRouterArgs = {
	name: 'users',
	dname: 'User',
	all: ['firstName', 'lastName', 'avatar', 'userGroup'],
	gaFields: ['firstName', 'lastName', 'avatar'],
	cascade: [
		{key:'userGroup',class:UserGroupArgs}
	],
	upload:user,

	gaQuery: (collection: DocumentCollection, sort: GeneratedAqlQuery, sortDir: GeneratedAqlQuery, offset: number, count: number, queryFields: GeneratedAqlQuery) => aql`
FOR z in ${collection}
	SORT z.${sort} ${sortDir}
	LIMIT ${offset}, ${count}
	LET a = (RETURN DOCUMENT(z.userGroup))[0]
	RETURN {${queryFields}userGroups:(RETURN {id:a._key,name:a.name})[0]}`
}

async function comment(comAr: IComment[], parent: string) {
	return db.collection(self.name).saveAll(await Promise.all(comAr.map(async com => {
        var nk = generateDBKey()
        if (typeof com === 'string') {
			throw new ReferenceError(`Comment ${com} not valid`)
		}
		if (typeof com.author !== 'string') {
			throw new TypeError(`Author ${com.author} is not a string reference`)
		}
	
		com.createdAt = new Date()
		com.updatedAt = new Date()
	
		delete com.id
		com.parent = parent
		com._key = nk

		console.log(`Comment added: ${com}`)

		return com
    }))) as Promise<IArangoIndexes[]>
}

const CommentArgs: IRouterArgs = {
	name: 'comments',
	dname: 'Comment',
	all: ['content', 'author', 'createdAt', 'updatedAt', 'parent'],
	gaFields: ['content', 'author', 'createdAt', 'updatedAt', 'parent'],
	cascade: [
		{ key: 'author', class: UserArgs }
	],
	upload: async function (self: IRouterArgs, key: string, data: IArangoIndexes, par?:string): Promise<IArangoIndexes> {
		delete data.id
		data._key = key

		let com = <IComment>data

		// Uploaded comments should always have reference Authors
		if (typeof com.author !== 'string') {
			throw new TypeError(`Author ${com.author} is not a string reference`)
		}

		com.createdAt = new Date()
		com.updatedAt = new Date()
		com.parent = par
		
		return db.collection(self.name) as IArangoIndexes
	}
}

async function task(self: IRouterArgs, key: string, data: IArangoIndexes, par?:string) {
	delete data.id
	data._key = key

	let task = <ITask>data

	// Convert from key to id
	const taskId = 'tasks/'.concat(key)

	if (!task.comments) {
        task.comments = []
    } else if (task.comments.length !== 0) {
        let comAr = await comment(task.comments as IComment[], taskId)
        task.comments = comAr.map(v => v._key as string)
    }
	
	task.module = par

	console.log(`Task uploaded: ${task}`)

	return db.collection(self.name).save(task) as IArangoIndexes
}

const TaskArgs: IRouterArgs = {
	name: 'tasks',
	dname: 'Task',
	all: ['title', 'status', 'assigned', 'comments', 'module'],
	gaFields: ['title', 'status', 'assigned', 'comments', 'module'],
	cascade: [
		{key:'assigned',class:UserArgs},
		{key:'comments',class:CommentArgs},
	],
	upload:task,
}

async function module_(self: IRouterArgs, key: string, data: IArangoIndexes, par?:string) {
	delete data.id
	data._key = key

	let mod = <IModule>data

	// Convert from key to id
	const modId = 'modules/'.concat(key)

	mod.tasks = await Promise.all(mod.tasks.map(async tsk => {
		if (typeof tsk !== 'string') {
			var nk = generateDBKey()
			await task(TaskArgs, nk, tsk, modId)
			return 'tasks/'.concat(nk)
		} else if (typeof tsk === 'string' && await db.collection(TaskArgs.name).documentExists(tsk)) {
			return 'tasks/'.concat(tsk)
		} else {
			throw new ReferenceError(`Task ${tsk} not valid`)
		}
	}))

	if (!mod.comments) {
		mod.comments = []
	} else if (mod.comments.length !== 0) {
		let comAr = await comment(mod.comments as IComment[], modId)
		mod.comments = comAr.map(v => v._key as string)
	}

	console.log(`Module added: ${mod}`)

	return db.collection(self.name).save(mod) as IArangoIndexes
}

const ModuleArgs: IRouterArgs = {
	name: 'modules',
	dname: 'Module',
	all: ['title', 'tasks', 'comments', 'project'],
	gaFields: ['title', 'tasks', 'comments', 'project'],
	cascade: [
		{key:'tasks',class:TaskArgs},
		{key:'comments',class:CommentArgs}
	],
	upload:module_,
}

async function project(self: IRouterArgs, key: string, data: IArangoIndexes) {
	delete data.id
	data._key = key

	let pro = <IProject>data
	
	// Convert from key to id
	const proId = 'projects/'.concat(key)

	if (!pro.comments) {
		pro.comments = []
	} else if (pro.comments.length !== 0) {
		let comAr = await comment(pro.comments as IComment[], proId)
		pro.comments = comAr.map(v => v._key as string)
	}

	pro.modules = await Promise.all(pro.modules.map(async mod => { 
		if (typeof mod !== 'string') {
			var nk = generateDBKey()
			await module_(ModuleArgs, nk, mod, proId)
			return 'modules/'.concat(nk)
		} else if (typeof mod === 'string' && await db.collection(ModuleArgs.name).documentExists(mod)) {
			return 'modules'.concat(mod)
		} else {
			throw new ReferenceError(`Module ${mod} not valid`)
		}
	}))

	// pro.users = await Promise.all(pro.users.map(async usr => {
	//     var nk = generateDBKey()
	//     if (typeof usr !== 'string') {
	//         await uploadUser(nk, usr, proId)
	//     } else {
	//         throw new ReferenceError(`User ${usr} not valid`)
	//     }
	//     return 'users/'.concat(nk)
	// }))

	pro.createdAt = new Date()
	pro.updatedAt = new Date()

	console.log(`Project added: ${pro}`)

	return db.collection(self.name).save(pro) as IArangoIndexes
}

const ProjectArgs: IRouterArgs = {
	name: 'projects',
	dname: 'Project',
	all: ['title', 'createdAt', 'updatedAt', 'start', 'end', 'status', 'comments', 'modules', 'users'],
	gaFields: ['title', 'createdAt', 'updatedAt', 'start', 'end', 'status', 'comments', 'modules', 'users'],
	cascade: [
		{key:'comments',class:CommentArgs},
		{key:'modules',class:ModuleArgs},
		{key:'users',class:UserArgs}
	],
	upload:project,
}

export function routerBuilder(version: string) {
	return new Router({prefix: `${version}/`})
	.use(new ApiRoute<IUser>(UserArgs).makeRouter().routes())
	.use(new ApiRoute<IUserGroup>(UserGroupArgs).makeRouter().routes())
	.use(new ApiRoute<IModule>(ModuleArgs).makeRouter().routes())
	.use(new ApiRoute<ITask>(TaskArgs).makeRouter().routes())
	.use(new ApiRoute<IComment>(CommentArgs).makeRouter().routes())
	.use(new ApiRoute<IProject>(ProjectArgs).makeRouter()
		.put('/:id', koaBody(), async ctx => {
            try {
                if (await db.collection(ProjectArgs.name).documentExists(ctx.params.id)) {
                    var body = ctx.request.body

                    var doc = await db.collection(ProjectArgs.name).document(ctx.params.id)

                    var proj: IProject = {
                        title: body.title || doc.title || 'New Project',
                        createdAt: doc.createdAt || new Date(),
                        updatedAt: new Date(),
                        start: body.start || doc.start || new Date(),
                        end: body.end || doc.end || new Date(),
                        status: body.status || doc.status || 'IN_PROGRESS',
                        comments: body.comments || doc.comments || [],
                        modules: body.modules || doc.modules || [],
                        users: body.users || doc.users || []
                    }

                    await db.collection(ProjectArgs.name).update(ctx.params.id, proj)

                    ctx.status = 200
                    ctx.body = `Document updated`
                    console.log(proj)
                } else {
                    ctx.status = 409
                    ctx.body = `Document [${ctx.params.id}] dne`
                }
            } catch(err) {
                console.log(err)
                ctx.status = 500
            }}).routes())
}
