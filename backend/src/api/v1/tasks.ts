import { db } from '../../database'
import { ITask, IArangoIndexes, IComment } from '../../lms/types'
import { getComment, uploadAllComments } from './comments'
import { getUser } from './users'

var TaskDB = db.collection('tasks')

export async function uploadTask(key: string, task: ITask, parent: string) {
	// Convert from key to id
	const taskId = 'tasks/'.concat(key)

	if (!task.comments) {
        task.comments = []
    } else if (task.comments.length !== 0) {
        let comAr = await uploadAllComments(task.comments as IComment[], taskId)
        task.comments = comAr.map(v => v._key as string)
    }

	task.module = parent
	task._key = key

	console.log(`Task uploaded: ${task}`)

	return TaskDB.save(task) as IArangoIndexes
}

export async function getTask(id: string, cascade?: boolean) {
	var task = await TaskDB.document(id) as ITask

	// task.id = task._key

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