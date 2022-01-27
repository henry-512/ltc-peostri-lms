export interface LoginInformation {
     username: string,
     password: string
}

export type Status = "IN_PROGRESS" | "COMLETED" | "ARCHIVED" | "AWAITING";

export interface IUser {
     firstName: string;
     lastName: string;
     avatar: null | string;
}

export interface IComment {
     content: string;
     author: string | IUser;
     created: Date;
     updated: Date;
}

export interface ITask {
     title: string;
     status: Status;
     assigned?: string | IUser | Array<IUser> | Array<string> | null; //TODO: Should this be a rank instead of a user??
     comments: Array<IComment>;
}

export interface ITaskReview extends ITask {
     type: "DOCUMENT_REVIEW";
}

export interface ITaskUpload extends ITask {
     type: "DOCUMENT_UPLOAD";
}

export interface IModule {
     title: string;
     tasks: Array<ITask>;
}

export interface IProject {
     title: string;
     created: Date;
     updated: Date;
     startDate: Date;
     endDate: Date;
     status: Status;
     comments: Array<IComment>;
     modules: Array<IModule>;
}

export interface IModuleTemplate extends IModule {
     description: string;
}

export interface IProjectTemplate {
     title: string;
     description: string;
     created: Date;
     updated: Date;
     modules: Array<IModule>;
}