import { IComment } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class CommentRoute extends ApiRoute<IComment> {
    constructor() {
        super(
            'comments',
            'Comment',
            {
                'content':{type:'string'},
                'author':{type:'fkey'},
                'parent':{type:'parent'}
            },
            true,
            {
                'author': UserRouteInstance
            },
            {local:'parent',foreign:'comments'}
        )
    }

    // NOTE: If this is supposed to be a comment reference
    // but does not exist, this generates a comment.
    protected override buildFromString(
        str:string,
        parent:string
    ) : IComment | null {
        // TODO: input validation
        let com: IComment = {
            content: str,
            // TODO: Make this into user validation
            author: 'users/0123456789012345678900',
            parent: parent
        }
        return com
    }
}

export const CommentRouteInstance = new CommentRoute()
