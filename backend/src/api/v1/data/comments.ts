import { IComment } from "../../../lms/types";
import { ApiRoute } from "../route";
import { UserRouteInstance } from "./users";
import { AuthUser } from "../../auth";

class CommentRoute extends ApiRoute<IComment> {
    constructor() {
        super(
            'comments',
            'comments',
            'Comment',
            {
                'content':{type:'string'},
                'author':{
                    type:'fkey',
                    foreignApi:UserRouteInstance
                },
                'parent':{
                    type:'parent',
                    parentReferenceKey:'comments',
                }
            },
            true,
        )
    }

    protected override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any,
        id: string,
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
        str:string,
        par:string,
    ) : Promise<IComment | null> {
        // TODO: input validation
        let com: IComment = {
            content: str,
            author: user.getId(),
            parent: par
        }
        return com
    }
}

export const CommentRouteInstance = new CommentRoute()
