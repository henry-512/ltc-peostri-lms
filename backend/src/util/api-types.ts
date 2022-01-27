// peostri-frontend/src/util/types.tsx

// import { ReduxState } from "react-admin"

export interface LoginInformation {
     username: string,
     password: string
}

// export type ThemeName = 'light' | 'dark';

export type Status = "IN_PROGRESS" | "COMLETED" | "ARCHIVED" | "AWAITING";

// export interface AppState extends ReduxState {
//      theme: ThemeName;
// }

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
     status: Status;
     comments: Array<IComment>;
     modules: Array<IModule>;


     id: number;
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