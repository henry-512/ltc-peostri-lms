# PEO STRI Logistics Management Software (Backend)

***NOT (fully) IMPLEMENTED YET***

Execution requires a ```.env``` file in the ```./build``` directory, with the following fields. This is used to connect to the database and what port to listen on.

```bash
API_PORT = "port"
DB_URL = "https://url.com"
DB_NAME = "dbname"
DB_USER = "username"
DB_PASS = "password"
```

# tech

Listens on port API_PORT

## api

### versions

- 1.0
  initial commit

### commands

```api/version/projects```
  

# todo

- ~~*real* configs~~
- ~~switch to typescript eventually maybe~~
- real aql parsing
  - return { api-key: d.db-key, ... } vs ts mapping ?
  - date format cant be converted in aql
    - date type?
  - comments / modules
  - getall limits/sort
- DB error catching
- Cache collections?

# others

- 409 error on POST?
- Refactor clientside
- IDs for everything

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
  .get('/', ctx => {
    console.log('Get all');
  })
  .get('/:id', ctx => {
    console.log('Get with id');
  })
  .post('/', koaBody(), ctx => {
    console.log('Create new');
  })
  .put('/:id', ctx => {
    console.log("Update with id or create one if dne");
  })
  .delete('/:id', ctx => {
    console.log('Delete with id');
  });

  JSON.stringify
  import { config } from './config'
```
