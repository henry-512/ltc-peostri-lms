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
API_PORT="1234"                 # Port number to run the backend server on
API_HOST="localhost:1234"       # Full hostname, including port. Used for static
                                # file URLs

DB_URL="http://url.com"         # URL or IP of the database server
DB_NAME="dbname"                # Name of the ArangoJS database on the database 
                                # server
DB_USER="username"              # Username for DB authentication
DB_PASS="password"              # Password for DB authentication

SECRET="JWTSecReT"              # Secret for JWT authentication
```

Additional `.env` settings are specified in `backend/api/config.ts`

Run:

```shell
cd backend
npm install
npm run build
npm run start
```

### Frontend

In the `frontend` directory:

Create `.env` file with the following contents:

```
REACT_APP_API_URL="http://url.com/api"  # API URL or IP of backend server. Note that 
                                        # this should point to the backends api path
                                        
AMBER_DAYS=5                            # How many days before the suspense date 
                                        # is Amber

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

## Folder Structure
- `/backend` - All backend files and documentation.
- `/backend-testing` - All backend automated blackbox testing files and documentation. ***currently broken***
- `/database` - Database dump files consisting of pre-built ranks, module templates, projects templates, and one user.
- `/docs` - General project documentation and user tutorials.
- `/frontend` - All frontend UI files and documentation.

## Demo Video
https://github.com/Capstone-US-Army-PEOSTRI/peostri-lms/blob/master/docs/demo/demo_video.mp4

# LTC Containerization

LTC expects a `.db_pass` file containing the database password. The password should only contain alphanumeric characters. Afterwards, running the `lms` build script in `ltc-server-bash` will start the containers.
