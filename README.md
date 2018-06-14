# TaskListServer
Simple tasklist http web service for managing task lists

Requires node.js 8.11 or higher. Download and install here, if neccesary: <link>http://nodejs.org</link>

Uses: ExpressJS, NodeJS, Typescript, Mongodb

To install & run:

  Prepare database:<br>
    >>1. Download and install mongodb <code>https://www.mongodb.com/</code><br>
    >>2. run mongod from a command prompt<br>
    >>3. Create a database named 'todolist' with a collection 'TaskList'<br>
    
  Clone, Build an Run the Application<br>
    1. clone repository and change to project directory<br>
    2. install dependencies: <code>npm install</code><br>
    3. build: <code>npm run build</code><br>
    4. start: <code>npm start</code><br>
    
  Run a query:<br>
    <code>http://localhost:4001/api/lists</code>    -- note that you can change the listening port in index.ts<br>

  About the code:<br>
    Task.ts       - definition of the Task class as well as JSON schema for validation<br>
    TaskList.ts   - definition of the TaskList class as well as JSON schema for validation<br>
    index.ts      - application logic and endpoint routes utilizing expressJS<br>
    datalayer.ts  - all database activity<br>

Communication between the datalayer and application logic is via Observables

Testing Done:<br>
  Manual testing using Google Arc<br>
    1. All endpoints tested for correct functionality<br>
    2. All endpoints tested for invalid input<br>
    3. All GET endpoints tested for not found<br>
    4. Invalid schema passed in body of POSTs to test correct status<br>
    5. PUT functions tested with intentional duplicates
    6. Database taken offline then restarted to test <br>

TODO:<br>
  Automated unit tests using Karma.<br>
  Automated end-to-end tests using Jasmine<br>

API Endpoints:<br>
GET:    API/lists -- return an array of task lists<br>
  parameters:<br>
    q     Query String to search for task list names<br>
    skip  number of records to skip for pagination<br>
    limit limit number of records returned<br>
  body:<br>
    array of task lists<br>
  status:<br>
    200   success<br>
    400   bad input<br>
    
GET:    API/list/{id} -- return a single task list with requested id<br>
  body:<br>
    task list or empty<br>
  status:<br>
    200   success<br>
    400   invalid id<br>
    404   list not found<br>
    
POST:   API/lists   -- insert an new tasklist<br>
  body:<br>
    JSON TaskList<br>
  status:<br>
    201   item created<br>
    400   invalid input<br>
    409   duplicate list exists<br>

POST: API/list/{id}/tasks -- add task into existing tasklist<br>
  body:<br>
    JSON task<br>
  status:<br>
    201   item created<br>
    400   invalid input<br>
    409   duplicate task exists<br>
    
POST: API/list/{id}/task/{id}/complete  -- mark a task as complete<br>
  body:<br>
    n/a<br>
  status:<br>
    201:  item updated<br>
    400:  invalid input<br>
  
