# TaskListServer
## Simple tasklist http web service for managing task lists

Requires node.js 8.11 or higher. Download and install here, if neccesary: <link>http://nodejs.org</link>

Uses: ExpressJS, NodeJS, Typescript, Mongodb

## To install & run:

### Prepare database:
  1. Download and install mongodb `https://www.mongodb.com/`
  2. run `mongod.exe` from a command prompt
  3. Create a database named 'todolist' with a collection 'TaskList'. This can be done through Mongo Compass or programatically.
    
### Clone, Build an Run the Application
  1. clone repository and change to project directory
  2. install dependencies `npm install` 
  3. build: `npm run build`
  4. start: `npm start`
    
### Run a query:
  `http://localhost:4001/api/lists`    -- note that you can change the listening port in index.ts

## About the code:
    Task.ts       - definition of the Task class as well as JSON schema for validation
    TaskList.ts   - definition of the TaskList class as well as JSON schema for validation
    index.ts      - application logic and endpoint routes utilizing expressJS
    datalayer.ts  - all database activity is handled here.

###  Communication between the datalayer and application logic is via `Observables`

## Testing Done:
### Manual testing using Google Arc
- All endpoints tested for correct functionality
- All endpoints tested for invalid input
- GET and PUT endpoints tested for not found as appropriate
- Invalid schema passed in body of POSTs to test correct status
- PUT functions tested with intentional duplicates
- Database taken offline then restarted to test 
- Database restart and auto reconnect

### TODO:
- Automated unit tests using Karma
- Automated end-to-end tests using Jasmine

## API Endpoints:
### GET:    API/lists -- return an array of task lists
###  parameters:
  Parameter | Description
  ----------|-----------------------------------
  q     | Query String to search for task list names
  skip  | Number of records to skip for pagination
  limit | Limit number of records returned
### body:
    JSON array of task lists
### status:
  code  |  Description
  ------|-----------------------------
  200 | success
  400 | bad input
    
### GET:    API/list/{id} -- return a single task list with requested id
###  body:
    JSON task list or empty
  status:
  code  |  Description
  ------|-----------------------------
  200   | success
  400   | invalid id
  404   | list not found
    
### POST:   API/lists   -- insert an new tasklist
### body:
    JSON TaskList
### status:
  code  |  Description
  ------|-----------------------------
  201 | item created
  400 | invalid input
  409 | duplicate list exists

### POST: API/list/{id}/tasks -- add task into existing tasklist
###  body:
    JSON task
###  status:
  code  |  Description
  ------|-----------------------------
  201 | item created
  400 | invalid input
  409 | duplicate task exists
    
### POST: API/list/{id}/task/{id}/complete  -- mark a task as complete
###  body:
    n/a
###  status:
  code  |  Description
  ------|-----------------------------
  201 | item updated
  400 | invalid input
  
