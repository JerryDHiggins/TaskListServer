
// src/index.ts
import * as express from 'express'
import { TaskList } from './shared/TaskList';
import {DataStore} from './db/datalayer';

const app = express()
const port = 4001
const isIntString: RegExp = new RegExp('^[0-9]+$');
const isv4UUID: RegExp = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$');

app.use(express.json());

app.get('/', (request, response, next) => {
    const resp: string = 'Task List Server Is Running: route: /';
    response.json(resp);
});

app.get('/api/lists/', (request, response) => {
    // if(id && string.match(/^[0-9]+$/) != null)
    let skip: number;
    let limit: number;
    let queryString: string = request.query.q;

    let badInput = false;
    let errorMessage: string;

    if(request.query.skip && isIntString.test(request.query.skip)) {
        skip = Number(request.query.skip);
    } else {
        if(request.query.skip) {    // not an integer number
            errorMessage = 'skip parameter must be a whole number';
            badInput = true;
        }
    }

    if(request.query.limit && isIntString.test(request.query.limit)) {
        limit = Number(request.query.limit);
    } else {
        if(request.query.limit) {    // not an integer number
            errorMessage = 'limit parameter must be a whole number';
            badInput = true;
        }
    }

    if(badInput) {
        response.status(400);
        response.send('Bad parameter(s): '+ errorMessage);
    } else {
        let ds: DataStore  = new DataStore();
        ds.getTaskLists(queryString,skip,limit).then(tlists => {
            response.status(200);
            response.json(tlists);
            response.send();
        });
    }
});

app.post('/api/lists/', (request, response) => {
    let bodystr: string = request.body;
    let taskList: TaskList = request.body;
    if((!taskList) || (!TaskList.validate(taskList))) {
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
        .catch(message => {
            response.status(409);
            response.json(message);
            response.send();
        });
    }
});

app.get('/api/list/:listId', (request, response) => {
    let listId: string = request.param('listId');
    if(!isv4UUID.test(listId)) {
        response.json('id must be a valid uuid');
        response.status(400);
        response.send();
    }
    let ds: DataStore = new DataStore();
    ds.getTaskListById(listId).then(tlists => {
        if(tlists.length == 0) {
            response.json('item not found');
            response.status(404);
            response.send();
        }
        response.json(tlists[0]);   // there can be only one
        response.status(200);
        response.send();
    });
});

app.post('/api/list/:listId/tasks', (request, response) => {
    let listId: string = request.param('listId');
    if(!isv4UUID.test(listId)) {
        response.json('id must be a valid uuid');
        response.status(400);
        response.send();
    }
    let ds: DataStore = new DataStore();
    const resp: string = 'route post: /api/list/:listId/tasks';
    response.json(resp);
});

app.post('/api/list/:listId/tasks/:taskId/complete', (request, response) => {
    const resp: string = 'route post: /api/list/:listId/tasks/:taskId/complete';
    response.json(resp);
});

app.get('/api/createtasks/', (request, response) => {
    let ds: DataStore = new DataStore();
    const resp: string = ds.createTaskLists();
    response.json(resp);
});

app.listen(port, () => {
    app.locals.ds = new DataStore();
    console.log(`App is listening on port ${port}`)
})