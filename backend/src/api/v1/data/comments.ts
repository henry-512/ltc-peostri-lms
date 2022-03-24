import { IComment } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'
import { UserManager } from './users'

class Comment extends DBManager<IComment> {
    constructor() {
        super(
            'comments',
            'Comment',
            {
                content: { type: 'string' },
                author: {
                    type: 'fkey',
                    foreignApi: UserManager,
                },
                parent: {
                    type: 'parent',
                    parentReferenceKey: 'comments',
                },
            },
            {
                hasCUTimestamp: true,
            }
        )
    }

    protected override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IComment> {
        if (!doc.author) {
            doc.author = user.getId()
        }
        return doc
    }

    // NOTE: If this is supposed to be a comment reference
    // but does not exist, this generates a comment.
    protected override async buildFromString(
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ): Promise<IComment | undefined> {
        // TODO: input validation
        let com: IComment = {
            id: this.db.generateDBID(),
            content: str,
            author: user.getId(),
            parent: par,
        }
        return com
    }
}

export const CommentManager = new Comment()
