export interface LoginInformation {
     username: string,
     password: string
}

export type Status = "IN_PROGRESS" | "COMLETED" | "ARCHIVED" | "AWAITING";
export type TaskTypes = "DOCUMENT_REVIEW" | "DOCUMENT_APPROVAL" | "MODULE_WAIVER" | "MODULE_WAIVER_APPROVAL"

// All are optional
export interface IArangoIndexes {
     _id?: string;
     _rev?: string;
     _key?: string;
}

export interface IUser extends IArangoIndexes {
     firstName: string;
     lastName: string;
     avatar: null | string;
     userGroup: string | IUserGroup;

     id?: string;
}

export interface IComment extends IArangoIndexes {
     content: string;
     author: string | IUser;
     createdAt?: string | Date;
     updatedAt?: string | Date;
     parent?: string | IModule | IProject;

     id?: string;
}

export interface ITask extends IArangoIndexes {
     title: string;
     status: Status;
     assigned?: Array<string> | Array<IUser>;
     module?: string | IModule;
     type?: TaskTypes;

     id?: string;
}

export interface ITaskReview extends ITask {
     
}

export interface ITaskUpload extends ITask {
     
}

export interface ITaskWaive extends ITask {

}

export interface IModule extends IArangoIndexes {
     title: string;
     tasks: Array<string> | Array<ITask>;
     comments: Array<string> | Array<IComment>;
     project?: string | IProject;
     status: Status | "WAIVED";

     id?: string;
}

export interface IProject extends IArangoIndexes {
     title: string;
     createdAt?: Date;
     updatedAt?: Date;
     start: Date;
     end: Date;
     status: Status;
     comments: Array<string> | Array<IComment>;
     modules: Array<string> | Array<IModule>;
     users: Array<string> | Array<IUser>;

     // Required for api. Alias for _key, dne in database
     id?: string;
}

export interface IUserGroup extends IArangoIndexes {
     name: string;
     permissions?: {
          perm1: boolean,
          perm2: boolean,
          perm3: boolean
     };
     
     id?: string;
}

export interface IModuleTemplate extends IModule, IArangoIndexes {
     description: string;
}

export interface IProjectTemplate extends IArangoIndexes {
     title: string;
     description: string;
     createdAt?: Date;
     updatedAt?: Date;
     modules: Array<IModule>;
}

export interface IGetListQuery {
     filter: Array<string>,
     range: Array<number>,
     sort: Array<string>
}