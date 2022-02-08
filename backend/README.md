# PEO STRI Logistics Management Software (Backend)

# build info

# Install

```
npm install
```

## Unix

```
npm run build
npm run start
```

## Windows

```
npm run winbuild
npm run start
```

Execution requires a ```.env``` file in the ```./build``` directory, with the following fields. This is used to connect to the database and what port to listen on.

```bash
API_PORT = "port"
DB_URL = "http://url.com"
DB_NAME = "dbname"
DB_USER = "username"
DB_PASS = "password"
```

# API

The server requires requests to be sent to `api/[version]/[collection]`. These
API calls have the same arguments and returns for each collection.

Collections:
- users
- userGroups
- tasks
- modules
- projects
- comments

## Requests

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

```json
[
  {
    "id": [id: database-key],
    "someForeignKey": [id: database-key],
    ... (typeof ICollection extends IArangoIndexes)
  },
  ...
]
```

#### Examples

| Call | Response
|-|-
| `users?range=0&range=1` | Get the first doc of `users`
| `users?range=10&range=20` | Get the second set of 10 `users`
| `users?sort=firstName&sort=ASC` | Sort by `firstName`, ascending

### `GET: collection/key`

Returns a dereferenced document with the passed key.

#### Return

Foreign keys in the document are dereferenced into documents.

```json
{
  "id": [id: database-key], //  same key as parameter to call
  "someForeignKey": {
    "id": [foreign-key: database-key],
    ... (typeof ICollection extends IArangoIndexes)
  },
  ... (typeof ICollection extends IArangoIndexes)
}
```

### `POST: collection`

Takes the document in the body and uploads it to the collection. Accepts dereferenced documents, and generates IDs if required.

#### Body

## Full route list

```
'/api/v1/users HEAD,GET',
'/api/v1/users/:id HEAD,GET',
'/api/v1/users POST',
'/api/v1/users DELETE',

'/api/v1/userGroups HEAD,GET',
'/api/v1/userGroups/:id HEAD,GET',
'/api/v1/userGroups POST',
'/api/v1/userGroups DELETE',

'/api/v1/modules HEAD,GET',
'/api/v1/modules/:id HEAD,GET',
'/api/v1/modules POST',
'/api/v1/modules DELETE',

'/api/v1/tasks HEAD,GET',
'/api/v1/tasks/:id HEAD,GET',
'/api/v1/tasks POST',
'/api/v1/tasks DELETE',

'/api/v1/comments HEAD,GET',
'/api/v1/comments/:id HEAD,GET',
'/api/v1/comments POST',
'/api/v1/comments DELETE',

'/api/v1/projects HEAD,GET',
'/api/v1/projects/:id HEAD,GET',
'/api/v1/projects POST',
'/api/v1/projects DELETE',
'/api/v1/projects/:id PUT'
```

# todo

- Cascade project delete
- real aql parsing
  - ~~return { api-key: d.db-key, ... } vs ts mapping ?~~
  - date format cant be converted in aql
    - ~~date type?~~
    - Verifiy it works
  - ~~comments / modules~~
  - ~~getall limits/sort~~
- uploadAllComments modify to accept string references

## done

- ~~*real* configs~~
- ~~switch to typescript eventually maybe~~
- ~~DB error catching~~
- ~~Cache collections?~~
- ~~Fix Content-Range headers~~
- ~~Key cross-referencing on creation~~

## low

- Multithread db upload?
- saveAll instead of seperate Save calls?
  - done for comments
- ~~DB request as query not document(...) calls?~~
  - not viable
- Prevent DB upload on error?

# others

- 409 error on POST?

# trash

[template](https://github.com/tonyghiani/koa-template)
https://github.com/Talento90/typescript-node
https://github.com/javieraviles/node-typescript-koa-rest
https://medium.com/@ogamba.co/how-to-create-a-web-app-with-react-koa-webpack-and-mysql-part-1-backend-e047eb3bbae2

```npm install```
```npm run start```
```git config user.[name, email] X```

# ts
```typescript
  .get('/', async ctx => {
    console.log('Get all');
    ctx.request.query
  })
  .get('/:id', async ctx => {
    console.log('Get with id');
    ctx.params.id
  })
  .post('/', async koaBody(), ctx => {
    console.log('Create new');
    ctx.request.body
  })
  .put('/:id', async koaBody(), ctx => {
    console.log("Update with id or create one if dne");
    // ???
  })
  .delete('/:id', async ctx => {
    console.log('Delete with id');
    ctx.params.id
  });

  JSON.stringify
  import { config } from './config'

  const cursor = await db.query(aql`
    let d = document(projects/${ctx.params.id})
    let c = (for dc in d.comments return document(dc))
    let m = (for dm in d.modules return document(dm))
    let u = (for du in d.users return document(du))
  `)
```
