import { db } from '../../database'
import { IComment } from '../../lms/types'
import { getUser } from './users'

var CommentDB = db.collection('comments')

export async function getComment(id: string, cascade?: boolean) {
	var com = await CommentDB.document(id) as IComment

	delete com._key
	delete com._id
	delete com._rev

	if (cascade) {
		if (com.author) {
			com.author = await getUser(com.author as string, cascade)
		}
	}

	return com	
}
