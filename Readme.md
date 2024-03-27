# TO DO

## Task 1 

+ Set up github repo
+ Install node, ts, server dep, npm init
+ create http server and graphql endpoint
+ encapsulate controller, service, model logic + mock implementation for CRUD requests and service method CRUD = create, read, update, delete 
+ native parser for gql queries and mutations, map parsed operations to service methods
+ install mongodb ORM
+ implement model actions with orm; link service methods with ORM actions, (?) remove model class


## Task 2
+ Create controller and service for parser task creation, create separate service for this
- Add state lock, optional - request queue
+ Implement stream download and ingesting
+ Logs and statistics


- exceptions and error handling: http url/method, gql schema/operation, data validation
+ Set up eslint, tslint
+- Unit tests (jest)
- API tests (?)
- Postman collection - upd and put to repo
- husky
- docker compose with Mongo + Node runtime
- code coverage
- readme about how to use
+ logs service encapsulation

## To Do:

+ ETL job: state lock [30]
- husky on commit into main: eslint, tests [20]
- GQL API tests - ? 
-(?) Postman collection JSON to export [5]
+ Code coverage on test [15]
- Readme about how to install and use both tasks: install, run server, run seeds, run tests and their meaning, run ETL job [30]
- log service everywhere + remove console.logs [20]
- Refactoring & Review [30]