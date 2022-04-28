/**
 * All database types managed by the system.
 */

import { IStepper } from './Stepper'

/** Task/module/project statuses */
export type Status =
    | 'IN_PROGRESS'
    | 'COMPLETED'
    | 'ARCHIVED'
    | 'AWAITING'
    | 'WAIVED'
/** Task types */
export type TaskTypes =
    | 'DOCUMENT_UPLOAD'
    | 'DOCUMENT_REVIEW'
    | 'DOCUMENT_REVISE'
    | 'DOCUMENT_APPROVE'
    | 'WAIVER_APPROVE'
/** User statuses */
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'INACTIVE' | 'SUSPENDED'

/**
 * ArangoDB and system internal values. Fields are optional since database requests don't want `.id` and outgoing requests only want `.id`
 */
export interface IArangoIndexes {
    // ArangoDB Internal
    _id?: string
    _rev?: string
    _key?: string
    /** Internal unique identifier */
    id?: string
}

/** DB elements with create/update timestamps */
export interface ICreateUpdate {
    createdAt?: string | Date
    updatedAt?: string | Date
}

/* Comments */
export interface IComment extends IArangoIndexes, ICreateUpdate {
    content: string
    author: string | IUser
    /** Reference to the document that the comment is attached to */
    parent?: string
}

/** Contains file metadata, such as it's title, author, location on disk, and URL for retrieval. */
export interface IFileMetadata extends IArangoIndexes, ICreateUpdate {
    title: string
    author: string | IUser
    /** URL to the /static handle */
    src?: string
    /** Path of the file on disk */
    pathTo: string
}

/** Revisions system for files */
export interface IFileRevisions extends IArangoIndexes, ICreateUpdate {
    /** The latest file tracked */
    latest: string | IFileMetadata
    /** An array of commented files that are awaiting review */
    reviews: string[] | IFileMetadata[]
    /** Previous versions of `latest` */
    old: string[] | IFileMetadata[]
    /** Previous files that were in `reviews` */
    oldReviews: string[] | IFileMetadata[]
    /** Reference to the module this object is stored by */
    module: string
}

/** A module template */
export interface IModuleTemplate extends IArangoIndexes {
    /** Time To Complete */
    ttc?: number
    title: string
    tasks: IStepper<ITaskTemplate>
    status: Status | 'WAIVED'
}

/** Modules */
export interface IModule extends IArangoIndexes {
    /** Time To Complete */
    ttc?: number
    /** Suspense date */
    suspense?: string | Date
    title: string
    tasks: IStepper<ITask> | IStepper<string>
    /** Current task step */
    currentStep: number
    comments: Array<string> | Array<IComment>
    /** Modules have the additional status option `WAIVED` */
    status: Status | 'WAIVED'
    /** Reference to the parent project */
    project?: string
    files?: string | IFileRevisions
    /** Percentage of tasks that have been completed */
    percent_complete?: number
    // Waiver settings
    /** True if this module is a waiver module */
    waive_module?: boolean
    /** The waive comment for this module */
    waive_comment?: string
}

/** Project templates */
export interface IProjectTemplate extends IArangoIndexes, ICreateUpdate {
    /** Time To Complete */
    ttc?: number
    title: string
    status: Status
    modules: IStepper<IModuleTemplate> | IStepper<string>
}

/** Project. Highest level construct. */
export interface IProject extends IArangoIndexes, ICreateUpdate {
    title: string
    start: string | Date
    suspense: string | Date
    /** Time To Complete */
    ttc?: number
    status: Status
    modules: IStepper<IModule> | IStepper<string>
    users: Array<string> | Array<IUser>
    /** The team this project is associated with */
    team?: string | ITeam
    currentStep: number
    /** True if users should be automatically assigned based on their rank */
    auto_assign: boolean
    /** Percentage of modules that are complete */
    percent_complete?: number
}

/** A type referencing all of the permissions */
export type PermissionType = keyof IPermission
/** Controls the behavior of `/xx/default/list` */
export type FetchType = 'ASSIGNED' | 'TEAM' | 'ALL'
/** The type values for permissions */
export type PermissionValue = FetchType | boolean

/** Permissions of a rank */
export interface IPermission {
    taskFetching: FetchType
    moduleFetching: FetchType
    projectFetching: FetchType
    verboseLogging: boolean
}

/** Default permissions */
export const defaultPermissions: IPermission = {
    taskFetching: 'ASSIGNED',
    projectFetching: 'ASSIGNED',
    moduleFetching: 'ASSIGNED',
    verboseLogging: false,
}

/** The rank and permissions of a user */
export interface IRank extends IArangoIndexes {
    name: string
    permissions?: IPermission
}

/** A task template. These do not exist in the database. */
export interface ITaskTemplate {
    title: string
    rank?: string
    type: TaskTypes
    status: Status
    ttc: number
}

/** A task. The lowest element of work */
export interface ITask extends IArangoIndexes {
    suspense?: string | Date
    ttc?: number
    title: string
    status: Status
    /** Assigned users */
    users: Array<string> | Array<IUser>
    rank?: string
    /** Reference to the task's module */
    module?: string
    /** Reference to the task's project */
    project?: string
    type: TaskTypes
}

/** User in the system */
export interface IUser extends IArangoIndexes {
    /** All teams the user are in */
    teams: string[] | ITeam[]
    firstName: string
    lastName: string
    /** A URL to an image for the user's avatar */
    avatar: string
    rank: string | IRank
    status: UserStatus

    username: string
    password: string
    firstVisited: string
    lastVisited: string
}

/** User teams */
export interface ITeam extends IArangoIndexes {
    name: string
    users: IUser[] | string[]
}

/** In-system notifications */
export interface INotification extends IArangoIndexes {
    recipient: string | IUser
    /** The resource that sent the notification. Used to link back to the sender. */
    sender: ISender
    content: string
    read: boolean
    type: NotificationType
    /** When the notification was created */
    createdAt: string
}

/** Notification type names */
export type NotificationType = 'PROJECT' | 'MODULE' | 'TASK' | 'USER'
/** Resource type names */
export type ResourceType = 'projects' | 'users' | 'modules' | 'tasks'

/** A map that converts between a `ResourceType` and a `NotificationType` */
export const ResourceTypeConverter: {
    [Key in ResourceType]: NotificationType
} = {
    projects: 'PROJECT',
    modules: 'MODULE',
    users: 'USER',
    tasks: 'TASK',
}

/** A sender of a notification */
export interface ISender {
    /* Human-readable display name */
    display: string
    /* Resource type that sent notification */
    resource: ResourceType
    /** `KEY` value of the resource that sent the notification */
    id: string
}

/** User-facing logs */
export interface IUserLog extends IArangoIndexes {
    content: string
    /** The resource that sent the notification. Used to link back to the sender. */
    sender: ISender
    project?: string
    module?: string
    task?: string
}
