import { IComment } from '../../../lms/types'
import { AuthUser } from '../../auth'
import { DBManager } from '../DBManager'

/** Comments directly attached to database objects. */
export class Comment extends DBManager<IComment> {
    constructor() {
        super(
            'comments',
            'Comment',
            {
                content: { type: 'string' },
                author: {
                    type: 'fkey',
                    managerName: 'users',
                },
                parent: {
                    type: 'parent',
                    parentReferenceKey: 'comments',
                },
            },
            { hasCreate: true, hasUpdate: true, defaultFilter: 'content' }
        )
    }

    protected override modifyDoc = (
        user: AuthUser,
        files: any,
        doc: any
    ): Promise<IComment> => {
        if (!doc.author) {
            doc.author = user.id
        }
        return doc
    }

    // NOTE: If this is supposed to be a comment reference but does not exist,
    // this generates a comment.
    protected override buildFromString = async (
        user: AuthUser,
        files: any,
        str: string,
        par: string
    ): Promise<IComment> => {
        // TODO: input validation
        let com: IComment = {
            id: this.db.generateDBID(),
            content: str,
            author: user.id,
            parent: par,
        }
        return com
    }
}

export const CommentManager = new Comment()
