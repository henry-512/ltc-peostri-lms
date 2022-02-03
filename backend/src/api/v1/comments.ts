import { db } from '../../database'
import { IComment, IArangoIndexes } from '../../lms/types'
import { generateDBKey } from '../../util'
import { getUser } from './users'

const CommentDB = db.collection('comments')

export async function uploadAllComments(comAr: IComment[], parent: string) {
	return CommentDB.saveAll(await Promise.all(comAr.map(async com => {
        var nk = generateDBKey()
        if (typeof com === 'string') {
			throw new ReferenceError(`Comment ${com} not valid`)
		}
		if (typeof com.author !== 'string') {
			throw new TypeError(`Author ${com.author} is not a string reference`)
		}
	
		com.createdAt = new Date()
		com.updatedAt = new Date()
	
		com.parent = parent
		com._key = nk

		console.log(`Comment added: ${com}`)

		return com
    }))) as Promise<IArangoIndexes[]>
}

export async function uploadComment(key: string, com: IComment, parent: string) {
	// Parent cannot be checked since it gets added to db last

	// Uploaded comments should always have reference Authors
	if (typeof com.author !== 'string') {
		throw new TypeError(`Author ${com.author} is not a string reference`)
	}

	com.createdAt = new Date()
	com.updatedAt = new Date()

	com.parent = parent
	com._key = key
	
	return CommentDB.save(com) as IArangoIndexes
}

export async function getComment(id: string, cascade?: boolean) {
	var com = await CommentDB.document(id) as IComment

	delete com._key
	delete com._id
	delete com._rev

	if (cascade && com.author) {
		com.author = await getUser(com.author as string, cascade)
	}

	return com	
}
