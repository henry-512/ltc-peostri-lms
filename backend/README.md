# PEO STRI LMS (Backend)

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Logistics Management Software API backend. Built in NodeJS using Typescript and Koa.

# Build Instructions

## Install

- Install NodeJS and NPM
- Git clone or extract to a directory
- Run the following in this (`backend`) directory to install relevant packages

```
npm install
```

## Execution

Execution requires a ```.env``` file in the ```./backend/build``` directory, with the following fields. This is used to connect to the database and what port to listen on.

```bash
API_PORT = "1234"
DB_URL = "http://url.com"
DB_NAME = "dbname"
DB_USER = "username"
DB_PASS = "password"
```

After installation, run the following commands depending on your operating system.

### Unix

```
npm run build
npm run start
```

### Windows

```
npm run winbuild
npm run start
```

## Testing

Testing scripts for the API are located in the `../backend-testing` folder, however can be executed using the following command. See also `README.md` in that folder for more information.

```
npm test
```

# API

The api routes start with `api/`, with non-authentication routes prefixed with their API version (currently `v1`). All routes are printed when the backend starts.

## Authentication API

All requests to `/api/` and its subdirectories is restricted to authenticated users. Authentication uses JWT tokens with a default lifespan of 24 hours (modifiable by the `.env` settings). To receive a token, send a `POST` request to `/auth` with the following body:

```json
{
  "username": "my-username",
  "password": "my-password"
}
```

This returns a JWT token as a cookie, with the name `token`.

## Administrative API

The server requires requests to be sent to `api/[version]/admin/[collection]/list`. These API calls have the same arguments and returns for each collection. The current collections are:

- ranks
- users
- teams
- tasks
- modules
- projects
- comments
- filemeta
- files
- notifications
- template/modules
- template/projects


### `GET: collection?query`

Queries the collection and returns an array of documents.

#### Valid query fields

```json
"sort": [ id-to-sort: string, ["ASC" | "DESC"] ]
"range": [ [offset: number], [limit: number] ]
```

#### Return

Returns an array of `[collection]` objects, as specified by the query with `id` set to the database key.
Does not dereference foreign keys in the objects, except for `users` (which dereferences the `name` and `id` of `userGroup`).

```js
[
  {
    id: [id: database-key],
    someForeignKey: [id: database-key],
    ... (typeof ICollection extends IArangoIndexes)
  },
  ...
]
```

#### Examples

| Call                            | Response                         |
| ------------------------------- | -------------------------------- |
| `users?range=0&range=1`         | Get the first doc of `users`     |
| `users?range=10&range=20`       | Get the second set of 10 `users` |
| `users?sort=firstName&sort=ASC` | Sort by `firstName`, ascending   |

### `GET: collection/key`

Returns a dereferenced document with the passed key.

#### Return

Foreign keys in the document are dereferenced into documents.

```js
{
  id: [id: database-key], //  same key as parameter to call
  someForeignKey: {
    id: [foreign-key: database-key],
    ... (typeof ICollection extends IArangoIndexes)
  },
  ... (typeof ICollection extends IArangoIndexes)
}
```

### `POST: collection`

Takes the document in the body and uploads it to the collection. Accepts dereferenced documents, and generates IDs if required.

#### Request

Requires a request body that matches the specific administrative type.

## Proceeding API

Proceeding routes use `proceeding/[resource]/[action]/[id]` to perform the action. The following actions are allowed for each resource.

### Projects and Modules

```
PUT proceeding/[modules | projects]/[complete | start | restart | advance]/:id
    :id is a module/project key (without `resource/` prefix)
  complete : status = COMPLETED/WAIVED (depending on waive status for modules (projects are never WAIVED)), also sets all modules/tasks to COMPLETED. support for checking if all modules/tasks are completed (currently not run)
  start    : status AWAITING -> IN_PROGRESS, also sets first step's modules/tasks to IN_PROGRESS (from AWAITING). eventually automated maybe
  restart  : status = IN_PROGRESS, removes file, sets all modules/tasks to AWAITING, and runs `start` operation
  advance  : runs `complete` if project/module would be completed (ie all steps complete) or `start` if it is AWAITING. Otherwise advances `currentStep` field and sets next step to IN_PROGRESS. Currently sets all modules/tasks status to COMPLETED, but has support for verifying all modules/tasks in the step are COMPLETED
```

### Tasks

```
complete ()
  Marks task as complete
upload ({ file: 'string-key' }) // file as a key into the multipart
  Sets file.latest as `file`, pushes old file.latest into file.old
review ({ file: 'string-key' }) // file as a key into the multipart
  Adds file into file.reviews
revise ({ review: 'fileKey' }) // review as a `File` db key for a review file that was reviewed
  Pushes 'revision' from the multipart into file.latest, moves old file.latest into file.old, moves `review` in file.reviews into file.oldReviews
approve ()
  Marks task as complete
```

# Keys and Ids Oh My

## `KEY`

A 22-character base-64 string randomly-generated UUID. Looks like `ASc_0eu4RojyvNZJT-P2AA`.

## `ID`

A `KEY` associated with a collection, separated with a `/`. Looks like `users/ASc_0eu4RojyvNZJT-P2AA`.

## Ok but why?

ArangoDB uses `KEY`-format as a primary key for documents. However, these are useless for indexing documents from collections. `DOCUMENT(...)` (used for generic document retrieval) requires an `ID`, not a `KEY`. This means documents from unknown locations at compile-time (such as a comment's parent field) cannot be properly referenced.

Database objects also require an `id` field (not to be confused with the `id` type) that is a `KEY`. This is used for indexing on the frontend. This `id` field must be a `KEY`, since the `ID` type is not url-safe (due to the `/`). 

## Solution

- The database stores all references in documents (such as a user's rank) as `ID`.
- All references are converted into `KEY` on GET routes (except for parent fields, which must remain as `ID`)

## Technical

- `database`
    - `get`: Expects `ID`, returns doc.id as `KEY`. Does not modify references.
    - `save`: Expects doc.id as `ID`.
    - `update`: Expects doc.id as `ID`.

# Full Router Dump

```
ADMIN
  Ranks
    /api/v1/admin/ranks/list HEAD,GET
    /api/v1/admin/ranks/list/:id HEAD,GET
    /api/v1/admin/ranks/list POST
    /api/v1/admin/ranks/list/:id PUT
    /api/v1/admin/ranks/list/:id DELETE
  Tasks
    /api/v1/admin/tasks/orphan DELETE
    /api/v1/admin/tasks/disown DELETE
    /api/v1/admin/tasks/list HEAD,GET
    /api/v1/admin/tasks/list/:id HEAD,GET
    /api/v1/admin/tasks/list POST
    /api/v1/admin/tasks/list/:id PUT
    /api/v1/admin/tasks/list/:id DELETE
  Modules
    /api/v1/admin/modules/orphan DELETE
    /api/v1/admin/modules/disown DELETE
    /api/v1/admin/modules/list HEAD,GET
    /api/v1/admin/modules/list/:id HEAD,GET
    /api/v1/admin/modules/list POST
    /api/v1/admin/modules/list/:id PUT
    /api/v1/admin/modules/list/:id DELETE
  Comments
    /api/v1/admin/comments/orphan DELETE
    /api/v1/admin/comments/disown DELETE
    /api/v1/admin/comments/list HEAD,GET
    /api/v1/admin/comments/list/:id HEAD,GET
    /api/v1/admin/comments/list POST
    /api/v1/admin/comments/list/:id PUT
    /api/v1/admin/comments/list/:id DELETE
  Projects
    /api/v1/admin/projects/disown DELETE
    /api/v1/admin/projects/list HEAD,GET
    /api/v1/admin/projects/list/:id HEAD,GET
    /api/v1/admin/projects/list POST
    /api/v1/admin/projects/list/:id PUT
    /api/v1/admin/projects/list/:id DELETE
  Users
    /api/v1/admin/users/disown DELETE
    /api/v1/admin/users/list HEAD,GET
    /api/v1/admin/users/list/:id HEAD,GET
    /api/v1/admin/users/list POST
    /api/v1/admin/users/list/:id PUT
    /api/v1/admin/users/list/:id DELETE
  Teams
    /api/v1/admin/teams/disown DELETE
    /api/v1/admin/teams/list HEAD,GET
    /api/v1/admin/teams/list/:id HEAD,GET
    /api/v1/admin/teams/list POST
    /api/v1/admin/teams/list/:id PUT
    /api/v1/admin/teams/list/:id DELETE
  Log/users
    /api/v1/admin/log/users/disown DELETE
    /api/v1/admin/log/users/list HEAD,GET
    /api/v1/admin/log/users/list/:id HEAD,GET
    /api/v1/admin/log/users/list POST
    /api/v1/admin/log/users/list/:id PUT
    /api/v1/admin/log/users/list/:id DELETE
  filemeta
    /api/v1/admin/filemeta/orphan DELETE
    /api/v1/admin/filemeta/disown DELETE
    /api/v1/admin/filemeta/list HEAD,GET
    /api/v1/admin/filemeta/list/:id HEAD,GET
    /api/v1/admin/filemeta/list POST
    /api/v1/admin/filemeta/list/:id PUT
    /api/v1/admin/filemeta/list/:id DELETE
  Files
    /api/v1/admin/files/disown DELETE
    /api/v1/admin/files/lost DELETE
    /api/v1/admin/files/list HEAD,GET
    /api/v1/admin/files/list/:id HEAD,GET
    /api/v1/admin/files/list POST
    /api/v1/admin/files/list/:id PUT
    /api/v1/admin/files/list/:id DELETE
  Notifications
    /api/v1/admin/notifications/read/:id PUT
    /api/v1/admin/notifications/disown DELETE
    /api/v1/admin/notifications/list HEAD,GET
    /api/v1/admin/notifications/list/:id HEAD,GET
    /api/v1/admin/notifications/list POST
    /api/v1/admin/notifications/list/:id PUT
    /api/v1/admin/notifications/list/:id DELETE
  Template/modules
    /api/v1/admin/template/modules/instance/:id HEAD,GET
    /api/v1/admin/template/modules/list HEAD,GET
    /api/v1/admin/template/modules/list/:id HEAD,GET
    /api/v1/admin/template/modules/list POST
    /api/v1/admin/template/modules/list/:id PUT
    /api/v1/admin/template/modules/list/:id DELETE
  Template/projects
    /api/v1/admin/template/projects/instance/:id HEAD,GET
    /api/v1/admin/template/projects/disown DELETE
    /api/v1/admin/template/projects/list HEAD,GET
    /api/v1/admin/template/projects/list/:id HEAD,GET
    /api/v1/admin/template/projects/list POST
    /api/v1/admin/template/projects/list/:id PUT
    /api/v1/admin/template/projects/list/:id DELETE
User-facing
  Files
    /api/v1/files/list/:id HEAD,GET
    /api/v1/files/latest/:id HEAD,GET
    /api/v1/files/static/:id/:filename HEAD,GET
  Tasks
    /api/v1/tasks/list/:id HEAD,GET
    /api/v1/tasks/assigned/count HEAD,GET
    /api/v1/tasks/assigned/list HEAD,GET
    /api/v1/tasks/team/count HEAD,GET
    /api/v1/tasks/team/list HEAD,GET
    /api/v1/tasks/all/count HEAD,GET
    /api/v1/tasks/all/list HEAD,GET
    /api/v1/tasks/default/count HEAD,GET
    /api/v1/tasks/default/list HEAD,GET
  Projects
    /api/v1/projects/list/:id HEAD,GET
    /api/v1/projects/assigned/count HEAD,GET
    /api/v1/projects/assigned/list HEAD,GET
    /api/v1/projects/team/count HEAD,GET
    /api/v1/projects/team/list HEAD,GET
    /api/v1/projects/all/count HEAD,GET
    /api/v1/projects/all/list HEAD,GET
    /api/v1/projects/default/count HEAD,GET
    /api/v1/projects/default/list HEAD,GET
  Modules
    /api/v1/modules/list/:id HEAD,GET
    /api/v1/modules/assigned/count HEAD,GET
    /api/v1/modules/assigned/list HEAD,GET
    /api/v1/modules/team/count HEAD,GET
    /api/v1/modules/team/list HEAD,GET
    /api/v1/modules/all/count HEAD,GET
    /api/v1/modules/all/list HEAD,GET
    /api/v1/modules/default/count HEAD,GET
    /api/v1/modules/default/list HEAD,GET
  Notifications
    /api/v1/notifications/list HEAD,GET
    /api/v1/notifications/readall PUT
    /api/v1/notifications/read/:id PUT
Proceeding
  Projects
    /api/v1/proceeding/projects/complete/:id PUT
    /api/v1/proceeding/projects/start/:id PUT
    /api/v1/proceeding/projects/restart/:id PUT
  Modules
    /api/v1/proceeding/modules/complete/:id PUT
    /api/v1/proceeding/modules/start/:id PUT
    /api/v1/proceeding/modules/restart/:id PUT
    /api/v1/proceeding/modules/advance/:id PUT
  Tasks
    /api/v1/proceeding/tasks/complete/:id PUT
    /api/v1/proceeding/tasks/upload/:id PUT
    /api/v1/proceeding/tasks/review/:id PUT
    /api/v1/proceeding/tasks/revise/:id PUT
    /api/v1/proceeding/tasks/approve/:id PUT
    /api/v1/proceeding/tasks/deny/:id PUT
```

