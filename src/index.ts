
// src/index.ts

import * as express from 'express'
import { Task, TaskSchema } from './shared/Task';
import { TaskList, TaskListSchema } from './shared/TaskList';
import {DataStore} from './db/datalayer';
import { isIntString, isv4UUID} from './shared/util';
import validator = require('express-validator');

var { Validator, ValidationError } = require('express-json-validator-middleware');
var jsonValidator = new Validator({allErrors: true});

const app = express();
var port = 401;
let ds: DataStore = new DataStore();
ds.connectDb().then(message => {
    console.log(message);
}).catch(err => {
    console.log(err);
});

app.use(express.json());
app.use(validator());

app.get('/', (request, response, next) => {
    let resp: string = 'TaskList server is running';
    response.status(200);
    response.send(resp);
});


app.get('/api/lists/', (request, response) => {
    request.check("skip", "skip must be an integer > 0").optional().isInt({'min': 0});
    request.check("limit", "limit must be an integer > 0").optional().isInt();
    request.check("q", "query string (q) must be alphanumeric [a-z, 0-9]").optional().isAlphanumeric();

    var errors = request.validationErrors();
    if (errors) {
        response.status(400);
        response.send(errors);
        return;
    } 

    let skip: number = (request.query.skip) ? Number(request.query.skip) : 0;
    let limit: number = (request.query.limit) ? Number(request.query.limit) : 0;
    let queryString: string = request.query.q;

    let badInput = false;
    let errorMessage: string;

    let ds: DataStore  = new DataStore();
    ds.getTaskLists(queryString,skip,limit)
        .then(tlists => {
            response.status(200);
            response.json(tlists);
            response.send();
        })
        .catch(err => {
            response.status(400);
            response.json(err);
            response.send();
        });
});

// app.post('/api/lists/', jsonValidator({body: TaskListSchema}), (request, response) => {
app.post('/api/lists/', (request, response) => {
    let taskList: TaskList = request.body;

    if((!taskList) || (!TaskList.validateIDs(taskList))) {
        response.status(400);
        response.json('invalid JSON object');
        response.send;
    } else {
        let ds: DataStore = new DataStore();
        ds.createTaskList(taskList).then( () => {
            response.status(201);
            response.json('item created');
            response.send();
        })
        .catch(err => {
            response.status(409);
            response.json(err);
            response.send();
        });
    }
});

app.get('/api/list/:listId', (request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);

    var errors = request.validationErrors();
    if (errors) {
        response.status(400);
        response.send(errors);
        return;
    } 

    let listId: string = request.param('listId');

    // let ds: DataStore = new DataStore();
    ds.getTaskListById(listId)
        .then(tlists => {
            if(tlists.length == 0) {
                response.json('item not found');
                response.status(404);
                response.send();
            }
            response.json(tlists[0]);   // there can be only one
            response.status(200);
            response.send();
        })
        .catch(message => {
            response.json(message);
            response.status(400);
            response.send();
        })
});

app.post('/api/list/:listId/tasks', jsonValidator.validate({body: TaskSchema}),(request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);

    var errors = request.validationErrors();
    if (errors) {
        response.status(400);
        response.send(errors);
        return;
    } 
    
    let listId: string = request.param('listId');
    let ds: DataStore = new DataStore();

    let task: Task = request.body;
    if(!Task.validateID(task)) {
        response.json('invalid JSON object');
        response.status(400);
        response.send();
    } else {
        ds.createTask(listId, task).then( () => {
            response.status(201);
            response.json('item created');
            response.send();
        })
        .catch(message => {
            response.status(409);
            response.json(message);
            response.send();
        });
    }

})

app.post('/api/list/:listId/task/:taskId/complete', (request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);
    request.check("taskId", "taskId must be a valid v4 UUID").isUUID(4);
    var errors = request.validationErrors();
    if (errors) {
        response.status(400);
        response.send(errors);
        return;
    } ;

    let listId: string = request.param('listId');
    let taskId: string = request.param('taskId');

    let ds: DataStore = new DataStore();
    ds.markTaskCompleted(listId, taskId)
        .then(() => {
            response.status(201);
            response.json('task updated to complete');
            response.send();
    })
    .catch(message => {
        response.status(400);
        response.json(message);
        response.send();
    });
});

// TODO: Figure out why the validation errors are not routing to the below function!?
app.use(function(err, request, response, next) {
    if (err instanceof ValidationError) {
        response.status(400);
        response.message('JSON Sent is not a valid task or tasklist object');
        response.send();
        next();
    }
    else next(err);
});

app.get('/api/createtasks/', (request, response) => {
    let ds: DataStore = new DataStore();
    const resp: string = ds.createTaskLists(40, 5);
    response.json(resp);
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})