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
                'parent':{type:'fkey'}
            },
            true,
            {
                'author': UserRouteInstance
            },
            {local:'parent',foreign:'comments'}
        )
    }
}

export const CommentRouteInstance = new CommentRoute()
