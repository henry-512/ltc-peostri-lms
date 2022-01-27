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

# tech

Listens on port API_PORT

```api/version/projects```

# todo

- ~~*real* configs~~
- ~~switch to typescript eventually maybe~~
- real aql parsing
  - ~~return { api-key: d.db-key, ... } vs ts mapping ?~~
  - date format cant be converted in aql
    - date type?
  - comments / modules
  - getall limits/sort
- DB error catching
- Cache collections?
- Fix Content-Range headers

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

  const cursor = await db.query(aql`
    let d = document('projects/'${ctx.params.id})
    let c = (for dc in d.comments return document(dc))
    let m = (for dm in d.modules return document(dm))
    let u = (for du in d.users return document(du))
  `)
```
