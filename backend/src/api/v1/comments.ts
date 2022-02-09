import { IComment } from "../../lms/types";
import { ApiRoute } from "./route";
import { UserRouteInstance } from "./users";

class CommentRoute extends ApiRoute<IComment> {
    constructor() {
        super(
            'comments',
            'Comment',
            ['content', 'author', 'createdAt', 'updatedAt', 'parent'],
            true,
            [
                {key: 'author', class: UserRouteInstance}
            ],
            {local:'parent',foreign:'comments'},
            null
        )
    }
}

export const CommentRouteInstance = new CommentRoute()
