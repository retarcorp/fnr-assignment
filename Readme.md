# F+R assignment
* Task 1: GraphQL server for CRUD over products
* Task 2: ETL background job and async trigger

Application uses remote MongoDB database (within Atlas), therefore, doesn't require installation of MongoDB on a local machine. Remote connection URI will be provided with .env file separately.

## Install
- Step 1: populate .env file with valid data. Values are to be requested separately from the repository. In the future can be integrated with 1password, AWS Secrets Manager, or any other secrets provider.
- Step 2: Install dependencies: `npm install`
- Step 3: Seed database. If you use your own database or one provided by me, it is highly recommended to run seeds. Seeds fill the database with initial data (producers, products), which makes testing process much easier and manual testing - more representative. To run seeds, trigger `npm run seed-db` command. 

## Run Server
- To start a server, run `npm run start`. GraphQL server will be available locally, on [http://localhost:3000/graphql](http://localhost:3000/graphql) address. That's it! System is set and running. 
- To view and launch a set of available queries and mutations, you might view Postman collection, saved in this repo under `*.postman_colection.json` filename. It can be easily imported and used for manual run.

## Run ETL Job
- For task 2, an ETL job exists in a repo. It can be triggered either by invoking `syncProducts` mutation on a running http server, or by running `npm run sync-products` command. ETL runner has a state lock, so no two sync jobs may run at the same time.

## Test
- Unit testing: `npm run test:unit`. Tests cover service's code, checking data logic and communication with database.
- API testing: `npm run test:api`. **This test may run only when http server is running!**. These tests act as a client running graphQL queries and mutations to a server, and then validate the results with DB data.


## Dev Ex
- `husky` is running eslint check and unit tests before every commit. No breaking code is to go to repository :) 
- `eslint` is used to take responsibility over code quality. Lint check can be ran manually via `npm run lint`
- test coverage: unit tests launch fails if Jest detects low code coverage. 
- postman collection: saved as an exported JSON, but can be shared among devs as well.
- api tests: designed as a third layer of quality assurance, though now not a part of any CI pipeline. Can be ran manually to check that from client's prospective everythin is fine, in the future can be used to run e2e tests on a staging environment. Also it's much more fun to run api tests rather than test each gql query manually from Postman.
- logs: `pino` is used for encapsulating logs logic. Logs can be further saved to any convenient destination.
