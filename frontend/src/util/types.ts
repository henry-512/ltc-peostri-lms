/**
* @file All Frontend Types
* @module Types
* @category Utilities
* @author Braden Cariaga
*/

import { RaRecord } from "react-admin";

export interface LoginInformation {
    username: string,
    password: string
}

export interface ITeam extends RaRecord {
    name: string
    users: IUser[] | string[]
}

export type NotificationTypes = "PROJECT" | "MODULE" | "TASK" | "USER";
export type Status = "IN_PROGRESS" | "COMPLETED" | "ARCHIVED" | "AWAITING" | "WAIVED";
export type TaskTypes = "DOCUMENT_UPLOAD" | "DOCUMENT_REVIEW" | "DOCUMENT_APPROVE" | "WAIVER_APPROVE";
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'SUSPENDED';

export interface INotification extends RaRecord {
    recipient: string | IUser
    content: string
    read: boolean
    createdAt: string
    type: NotificationTypes
    sender: {
        resource: 'projects' | 'users' | 'modules' | 'tasks'
        id: string
    }
}

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

export interface IUser extends RaRecord {
    firstName: string;
    lastName: string;
    avatar?: string;
    rank: string | IRank;
    useEmail?: boolean;
    password?: string;
    email?: string;
    firstVisited?: string;
    lastVisited?: string;
    status?: UserStatus;
}

export interface IComment extends RaRecord, ICreateUpdate {
    content: string;
    author: string | IUser;
    parent?: string | IModule | IProject;
}

export interface ITask extends RaRecord {
    title: string;
    status: Status;
    users?: Array<string> | Array<IUser>;
    module?: string | IModule;
    type?: TaskTypes;
    rank?: string
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

export interface ITaskWaiverReview extends ITask {
    type: "WAIVER_APPROVE";
}

export interface IFile {
    rawFile: any;
    title: string;
    src: string;
    uploadedAt: string | Date
}

export interface IModule extends RaRecord {
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
    files?: {
        latest?: any,
        old: any[],
        reviews: any[],
        oldReviews: any[]
    };
    ttc?: number | string
    waive_comment?: string
}

export interface IProject extends RaRecord, ICreateUpdate {
    title: string;
    start: Date | string;
    suspense: Date | string;
    status: Status;
    modules: IModuleStep;
    users: Array<string> | Array<IUser>;
    auto_assign?: boolean;
    author?: IUser | string;
    module_template_id?: string;
    ttc?: number | string;
    currentStep?: number | string;
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
    ttc: string | number;
}

export interface IModuleTemplate extends IModule {
    ttc: string | number;
    tasks: {
        [id: string | number]: ITaskTemplate[]
    }
    [id: string]: any;
}

export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
    title: string;
    ttc: string | number;
    modules: Array<IModule>;
    module_template_id?: string;
}

export interface IGetListQuery {
    filter: Array<string>;
    range: Array<number>;
    sort: Array<string>;
}