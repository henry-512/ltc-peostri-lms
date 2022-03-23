import { IComment } from "../../../lms/types";
import { UserManager } from "./users";
import { AuthUser } from "../../auth";
import { DBManager } from "../DBManager";

class Comment extends DBManager<IComment> {
    constructor() {
        super(
            'comments',
            'Comment',
            {
                'content':{type:'string'},
                'author':{
                    type:'fkey',
                    foreignApi:UserManager
                },
                'parent':{
                    type:'parent',
                    parentReferenceKey:'comments',
                }
            },
            true,
        )
    }

    public override async getFromDB(user: AuthUser, depth: number, id: string): Promise<IComment> {
        // Only modules have depth 1
        if (depth !== 1) {
            return super.getFromDB(user, depth, id)
        }

        let doc = await this.db.get(id)

        // :)
        return doc.content as any
    }

    protected override async modifyDoc(
        user: AuthUser,
        files: any,
        doc: any,
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
    ) : Promise<IComment | undefined> {
        // TODO: input validation
        let com: IComment = {
            id: this.db.generateDBID(),
            content: str,
            author: user.getId(),
            parent: par
        }
        return com
    }
}

export const CommentManager = new Comment()
