import { generateDBKey } from '../../util'
import { db } from '../../database'
import { IArangoIndexes, IModule, IComment } from '../../lms/types'
import { getComment, uploadAllComments } from './comments'
import { getTask, uploadTask } from './tasks'

const ModuleCol = db.collection('modules')

/**
 * Adds a passed module to the database
 */
export async function uploadModule(key: string, mod: IModule, parent: string) {
	// Convert from key to id
	const modId = 'modules/'.concat(key)

	mod.tasks = await Promise.all(mod.tasks.map(async tsk => {
        var nk = generateDBKey()
        if (typeof tsk !== 'string') {
            await uploadTask(nk, tsk, modId)
        } else {
            throw new ReferenceError(`Task ${tsk} not valid`)
        }
        return 'tasks/'.concat(nk)
    }))

	if (!mod.comments) {
        mod.comments = []
    } else if (mod.comments.length !== 0) {
        let comAr = await uploadAllComments(mod.comments as IComment[], modId)
        mod.comments = comAr.map(v => v._key as string)
    }

	console.log(`Module added: ${mod}`)

	return ModuleCol.save(mod) as IArangoIndexes
}

export async function getModule(id: string, cascade?: boolean) {
	var mod = await ModuleCol.document(id) as IModule

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