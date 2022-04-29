### Frontend

In the `frontend` directory:

- Create `.env` file with the following contents:

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
