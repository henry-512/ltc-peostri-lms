# PEO STRI LMS

Logistics Management Software for PEO STRI.

## Installation and Startup
## Startup - Database
- Download and Install ArangoDB (https://www.arangodb.com/download-major/)
- Import Database DUMP file located in the "database" directory.
- - 
## Startup - Backend
In the "backend" directory:
- Create ```.env``` file with the following contents:
```
API_PORT = "1234"             # Port number to run the backend server on
DB_URL = "http://url.com"     # URL or IP of the database server
DB_NAME = "dbname"            # Name of the database on the database server
DB_USER = "username"          # Name of the user to use to connect to the database server
DB_PASS = "password"          # Password of the user to connect to the database server
```
- Run command ```npm install```
- Run command ```npm run build```
- Run command ```npm run start```
## Startup - Frontend
In the "frontend" directory:
- Create ```.env``` file with the following contents:
```
REACT_APP_API_URL="http://url.com"  # API URL or IP of backend server.
REACT_APP_API_VERSION="v1"          # API Version Number (Current: v1)
APP_PORT=                           # Port number to run the frontend server.
```
- Run command ```npm install```
- Run command ```npm run build```
- Run command ```npm run start```
