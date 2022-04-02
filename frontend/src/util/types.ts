import { Record, ReduxState } from "react-admin";

export type ThemeName = 'light' | 'dark';

export interface AppState extends ReduxState {
    theme: ThemeName;
}

export interface LoginInformation {
    username: string,
    password: string
}

export type Status = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "AWAITING";
export type TaskTypes = "DOCUMENT_UPLOAD" | "DOCUMENT_REVIEW" | "MODULE_WAIVER" | "MODULE_WAIVER_APPROVAL" | "DOCUMENT_APPROVE"
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'SUSPENDED'

// All are optional
export interface IArangoIndexes {
    _id?: string;
    _rev?: string;
    _key?: string;

    id?: string;
}

export interface ITaskStep {
    [id: number | string]: ITask[]
}
export interface IModuleStep {
    [id: number | string]: IModule[]
}

// DB elements with create/update timestamps
export interface ICreateUpdate {
    createdAt?: string | Date;
    updatedAt?: string | Date;
}

export interface IUser extends Record {
    firstName: string;
    lastName: string;
    avatar: null | string;
    rank: string | IRank;
    useEmail?: boolean;
    password?: string;
    email?: string;
    firstVisited?: string;
    lastVisited?: string;
    status?: UserStatus;
}

export interface IComment extends IArangoIndexes, ICreateUpdate {
    content: string;
    author: string | IUser;
    parent?: string | IModule | IProject;
}

export interface ITask extends IArangoIndexes {
    title: string;
    status: Status;
    assigned?: Array<string> | Array<IUser>;
    module?: string | IModule;
    type?: TaskTypes;
}

export interface ITaskReview extends ITask {
    type: "DOCUMENT_REVIEW";
}

export interface ITaskUpload extends ITask {
    type: "DOCUMENT_UPLOAD";
}

export interface ITaskApproval extends ITask {
    type: "DOCUMENT_APPROVE";
}

export interface ITaskWaiver extends ITask {
    type: "MODULE_WAIVER";
}

export interface ITaskWaiverReview extends ITask {
    type: "MODULE_WAIVER_APPROVAL";
}

export interface IFile {
    rawFile: any;
    title: string;
    src: string;
}

export interface IModule extends IArangoIndexes {
    title: string;
    tasks: ITaskStep;
    comments: Array<string> | Array<IComment>;
    project?: string | IProject;
    status: Status | "WAIVED";
    waive_module?: boolean;
    waive?: {
        author?: string | IUser;
        file: any;
        comment: string;
    };
    file?: any;
}

export interface IProject extends IArangoIndexes, ICreateUpdate {
    title: string;
    start: Date;
    end: Date;
    status: Status;
    modules: IModuleStep;
    users: Array<string> | Array<IUser>;
    auto_assign?: boolean;
    author?: IUser | string;
    module_template_id?: string;
}

export interface IRank extends IArangoIndexes {
    name: string;
    permissions?: {
        perm1: boolean;
        perm2: boolean;
        perm3: boolean;
    };
}

export interface IFileMetadata extends IArangoIndexes, ICreateUpdate {
    name: string;
    author: string | IUser;
    location: {
        name: string;
        revision: string;
    }
}

export interface ITaskTemplate extends ITask {
    ttc: number;
}

export interface IModuleTemplate extends IModule, IArangoIndexes {
    ttc: number;
    tasks: {
        [id: string | number]: ITaskTemplate[]
    }
    [id: string]: any;
}

export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
    title: string;
    ttc: number;
    modules: Array<IModule>;
    module_template_id?: string;
}

export interface IGetListQuery {
    filter: Array<string>;
    range: Array<number>;
    sort: Array<string>;
}