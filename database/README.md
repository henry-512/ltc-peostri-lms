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