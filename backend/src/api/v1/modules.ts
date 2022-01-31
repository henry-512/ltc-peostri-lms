import { db } from '../../database'
import { IArangoIndexes, IModule } from '../../lms/types'
import { getComment } from './comments'
import { getTask } from './tasks'

var ModuleDB = db.collection('modules')

/**
 * Adds a passed module to the database, and returns its ID.
 * TODO: input conversion
 */
export async function uploadModule(mod: IModule) {
	return await ModuleDB.save(mod) as IArangoIndexes
}

export async function getModule(id: string, cascade?: boolean) {
	var mod = await ModuleDB.document(id) as IModule

	// mod.id = mod._key

	delete mod._key
	delete mod._id
	delete mod._rev

	if (cascade) {
		if (mod.comments) {
			mod.comments = await Promise.all(mod.comments.map(async c => await getComment(c as string, cascade)))
		}
		if (mod.tasks) {
			mod.tasks = await Promise.all(mod.tasks.map(async t => await getTask(t as unknown as string, cascade)))
		}
	}

	return mod
}