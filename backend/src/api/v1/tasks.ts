import { db } from '../../database'
import { ITask } from '../../lms/types'
import { getComment } from './comments'
import { getUser } from './users'

var TaskDB = db.collection('tasks')

export async function getTask(id: string, cascade?: boolean) {
	var task = await TaskDB.document(id) as ITask

	// mod.id = mod._key

	delete task._key
	delete task._id
	delete task._rev

	if (cascade) {
		task.comments = await Promise.all(task.comments.map(async c => await getComment(c as string, cascade)))
		if (task.assigned) {
			task.assigned = await Promise.all(task.assigned.map(async t => await getUser(t as string, cascade)))
		}
	}

	return task
}