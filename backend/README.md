# PEO STRI LMS (Backend)

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

The server requires requests to be sent to `api/[version]/[collection]`. These API calls have the same arguments and returns for each collection. The current collections are:

- users
- userGroups
- tasks
- modules
- projects
- comments
- fileMetadata

## Authentication

All requests to `/api/` and its subdirectories is restricted to authenticated users. Authentication uses JWT tokens with a lifespan of 1 hour. To recieve a token, send a `POST` request to `/auth` with the following body:

```json
{
  "username": "my-username",
  "password": "my-password"
}
```

This returns a JWT token as a cookie, with the name `token`.

## `GET: collection?query`

Queries the collection and returns an array of documents.

### Valid query fields

```json
"sort": [ id-to-sort: string, ["ASC" | "DESC"] ]
"range": [ [offset: number], [limit: number] ]
```

### Return

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

### Examples

| Call | Response
|-|-
| `users?range=0&range=1` | Get the first doc of `users`
| `users?range=10&range=20` | Get the second set of 10 `users`
| `users?sort=firstName&sort=ASC` | Sort by `firstName`, ascending

## `GET: collection/key`

Returns a dereferenced document with the passed key.

### Return

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

## `POST: collection`

Takes the document in the body and uploads it to the collection. Accepts dereferenced documents, and generates IDs if required.

### Body

# TODO

## Modifications

- Proper error responses from the DB
  - 409 on POST
- Actual logger

## Known oversights

- `PUT` can remove foreign keys without warning, creating a memory leak

## thinking

- Multithread db upload?
