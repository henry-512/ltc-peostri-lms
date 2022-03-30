# PEO STRI LMS

Logistics Management Software for PEO STRI.

## Installation and Startup

Requires NodeJS, NPM, and Typescript

### Database

- Download and Install ArangoDB (https://www.arangodb.com/download-major/)
- Move the files located in `database` directory to the local files on ArangoDB server.
- Start up the database server by running:
```
arangod --server.endpoint "tcp://0.0.0.0:3000"
# Replace 0.0.0.0:3000 with the specifed IP and Port.
```
- Import the database data, by running:
```
arangorestore --server.database "[DATABASE_NAME]" --create-database true --input-directory "[DRECTORY_OF_FILES]"
# Replace [DATABASE_NAME] with the database name.
# Replace [DIRECTORY_OF_FILES] with the database file directory location.
``` 

### Backend

In the `backend` directory:

- Create `.env` file with the following contents:

```
API_PORT = "1234"             # Port number to run the backend server on
DB_URL = "http://url.com"     # URL or IP of the database server
DB_NAME = "dbname"            # Name of the ArangoJS database on the database server
DB_USER = "username"          # Name of the user to use to connect to the database server
DB_PASS = "password"          # Password of the user to connect to the database server
```

Run:

```shell
cd backend
npm install
npm run build
npm run start
```

### Frontend

In the `frontend` directory:

- Create `.env` file with the following contents:

```
REACT_APP_API_URL="http://url.com/api"  # API URL or IP of backend server. Note that this
                                        #   should point to the backend's `api` path
REACT_APP_API_VERSION="v1"              # API Version Number (Current: v1)
APP_PORT= "1234"                        # Port number to run the frontend server.
```

Run:

```shell
cd frontend
npm install
npm run build
npm run start
```
