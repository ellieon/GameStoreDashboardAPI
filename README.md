# GameStoreDashboardAPI
 
## Running locally for development
Follow these steps to get the application up and running:
* Create a file named `.env` at the root of the project and input the variables from the environment variables section into it
* Run `npm install` 
* Run `docker-compose up`
* Run `npm run db:create`
* Run `npm run start`
 
## Environment variables
 
The following environment variables will need to be specified in a .env file in the root of the project

`PORT` The port the api will bind to
`QUERY_URL` The base url for the query API of the game store
`CATEGORY_URL` The base url for the category API of the game store
`DATABASE_URL` The database connection string for the PostgreSQL server that this server will use
  * If using the docker compose file, the default string `DATABASE_URL=postgresql://manager:password@localhost:5432/manager` will work
`ADMIN_NAME` The username for the initial admin account
`ADMIN_EMAIL` The email for the initial admin account 
`API_SECRET` Secret that will be used to salt api keys before hashing 
`INITIAL_ADMIN_API_KEY` The initial API key that will be seeded into the database
`ENABLE_SCHEDULER` Set this to true if you want to enable cron jobs to run on the fetch service