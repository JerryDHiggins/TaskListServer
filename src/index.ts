
// src/index.ts

var express = require('express');
var validator = require('express-validator');
import { Task, TaskSchema } from './shared/Task';
import { TaskList, TaskListSchema } from './shared/TaskList';
import {DataStore, dataLayerMessage} from './db/datalayer';


var { Validator, ValidationError } = require('express-json-validator-middleware');
var jsonValidator = new Validator({allErrors: true});

const app = express();
var port = 4001;
let ds: DataStore = new DataStore();
ds.connectDb().then(message => {
    console.log(message);
}).catch(err => {
    console.log(err);
});

function mapMessageToCode(defaultCode: number, message: any) : number {
    if(!(typeof message === "string")) {
        // bail if this is not a string as "message" may have been returned by another
        // component
        return defaultCode;
    }
    if (message.match(dataLayerMessage.errcantconn)) return 500;
    if (message.match(dataLayerMessage.errnoconn)) return 500;
    if (message.match(dataLayerMessage.duplist)) return 409;
    if (message.match(dataLayerMessage.duptask)) return 409;
    return defaultCode;
}

app.use(express.json());
app.use(validator());

app.get('/', (request, response, next) => {
    response.status(200).send('TaskList server is running');
});

app.get('/api/lists/', (request, response) => {
    request.check("skip", "skip must be an integer > 0").optional().isInt({'min': 0});
    request.check("limit", "limit must be an integer > 0").optional().isInt({'min': 0});
    request.check("q", "query string (q) must be alphanumeric [a-z, 0-9]").optional().isAlphanumeric();

    var errors = request.validationErrors();
    if (errors) {
        response.status(400).send(errors);
    } 

    let skip: number = (request.query.skip) ? Number(request.query.skip) : 0;
    let limit: number = (request.query.limit) ? Number(request.query.limit) : 0;
    let queryString: string = request.query.q;

    ds.getTaskLists(queryString,skip,limit)
        .then(tlists => {
            response.status(200).json(tlists);
        })
        .catch(err => {
            let statuscode: number = mapMessageToCode(400, err);
            response.status(statuscode).json(err);
        });
});

app.post('/api/lists/', jsonValidator.validate({body: TaskListSchema}), (request, response) => {
    let taskList: TaskList = request.body;

    if((!taskList) || (!TaskList.validateIDs(taskList))) {
        response.status(400).json('invalid JSON object').send();
    } else {
        ds.createTaskList(taskList).then( () => {
            response.status(201).json('item created').send();
        })
        .catch(err => {
            let statuscode: number = mapMessageToCode(400, err);
            response.status(statuscode).json(err).send();
        });
    }
});

app.get('/api/list/:listId', (request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);

    var errors = request.validationErrors();
    if (errors) {
        response.status(400).send(errors)
        return;
    } 

    let listId: string = request.params['listId'];

    ds.getTaskListById(listId)
        .then(tlists => {
            if(tlists.length == 0) {
                response.status(404).json('item not found').send();
            }
            response.json(tlists[0]).status(200).send();
        })
        .catch(err => {
            let statuscode: number = mapMessageToCode(400, err);
            response.status(statuscode).json(err).send();
        })
});

app.post('/api/list/:listId/tasks', jsonValidator.validate({body: TaskSchema}),(request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);

    var errors = request.validationErrors();
    if (errors) {
        response.status(400).send(errors);
        return;
    } 
    
    let listId: string = request.params['listId'];
    let task: Task = request.body;
    if(!Task.validateID(task)) {
        response.json('invalid JSON object').status(400).send();
    } else {
        ds.createTask(listId, task).then( () => {
            response.status(201).json('item created').send();
        })
        .catch(err => {
            let statuscode: number = mapMessageToCode(409, err);
            response.status(statuscode).json(err).send();
        });
    }
})

app.post('/api/list/:listId/task/:taskId/complete', (request, response) => {
    request.check("listId", "listId must be a valid v4 UUID").isUUID(4);
    request.check("taskId", "taskId must be a valid v4 UUID").isUUID(4);
    var errors = request.validationErrors();
    if (errors) {
        response.status(400).send(errors);
        return;
    } ;

    let listId: string = request.params['listId'];
    let taskId: string = request.params['taskId'];

    ds.markTaskCompleted(listId, taskId)
        .then(() => {
            response.status(201).json('task updated to complete').send();
    })
    .catch(message => {
        response.status(400).json(message).send();
    });
});

app.use(function(err, request, response, next) {
    if (err instanceof ValidationError) {
        response.status(400).send('JSON Sent is not a valid task or tasklist object');
    }
    else next(err);
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/api/createtasks/', (request, response) => {
    const resp: string = ds.createTaskLists(40, 5);
    response.json(resp);
});

app.listen(port, () => {
    console.log(`App is listening on port ${port}`)
})