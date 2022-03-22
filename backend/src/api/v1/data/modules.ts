import { IModule } from "../../../lms/types";
import { CommentRouteInstance } from "./comments";
import { FilemetaRouteInstance } from "./filemeta";
import { ApiRoute } from "../route";
import { TaskRouteInstance } from "./tasks";
import { AuthUser } from "../../auth";

class ModuleRoute extends ApiRoute<IModule> {
    constructor() {
        super(
            'modules',
            'modules',
            'Module',
            {
                'title':{type:'string'},
                'tasks':{
                    type:'fkeyStep',
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:TaskRouteInstance,
                },
                'waive_comment': {
                    type:'fkey',
                    optional:true,
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentRouteInstance,
                },
                'comments':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentRouteInstance,
                },
                'project':{
                    type:'parent',
                    parentReferenceKey:'modules'
                },
                'status':{
                    type:'string',
                    default: 'AWAITING'
                },
                'waive_module':{
                    type:'boolean',
                    optional:true,
                    default:false
                },
                'waive_module_file':{
                    type:'fkey',
                    optional:true,
                    acceptNewDoc:true,
                    foreignApi:FilemetaRouteInstance,
                },
                'files':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    acceptNewDoc:true,
                    foreignApi:FilemetaRouteInstance
                },
            },
            false,
        )
    }

    protected override modifyDoc(
        user: AuthUser,
        files: any,
        doc: any,
        id: string,
    ): Promise<IModule> {
        // Convert a single file into a file array
        if (doc.file) {
            if (doc.files) {
                doc.files.append(doc.file)
            } else {
                doc.files = [doc.file]
            }
            delete doc.file
        }
        return doc
    }
}

export const ModuleRouteInstance = new ModuleRoute()
