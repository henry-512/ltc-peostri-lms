import { IModule } from "../../../lms/types";
import { CommentManager } from "./comments";
import { FilemetaManager } from "./filemeta";
import { TaskManager } from "./tasks";
import { AuthUser } from "../../auth";
import { DBManager } from "../DBManager";

class Module extends DBManager<IModule> {
    constructor() {
        super(
            'modules',
            'Module',
            {
                'title':{type:'string'},
                'tasks':{
                    type:'fkeyStep',
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:TaskManager,
                },
                'waive_comment': {
                    type:'fkey',
                    optional:true,
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentManager,
                },
                'comments':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    freeable:true,
                    acceptNewDoc:true,
                    foreignApi:CommentManager,
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
                    foreignApi:FilemetaManager,
                },
                'files':{
                    type:'fkeyArray',
                    optional:true,
                    default:[],
                    acceptNewDoc:true,
                    foreignApi:FilemetaManager
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

export const ModuleManager = new Module()
