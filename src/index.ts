
// src/index.ts
import * as express from 'express'
import { TaskList } from './shared/TaskList';
import {DataStore} from './db/datalayer';

const app = express()
const port = 4001

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
    const regExpInt: RegExp = new RegExp('^[0-9]+$');
    let matcher = regExpInt.test(request.query.skip);
    console.log(matcher);
    if(request.query.skip && regExpInt.test(request.query.skip)) {
        skip = Number(request.query.skip);
    } else {
        if(request.query.skip) {    // not an integer number
            errorMessage = 'skip must be a whole number';
            badInput = true;
        }
    }

    if(request.query.limit && regExpInt.test(request.query.limit)) {
        limit = Number(request.query.limit);
    } else {
        if(request.query.limit) {    // not an integer number
            errorMessage = 'limit must be a whole number'
            badInput = true;
        }
    }

    if(badInput) {
        response.send('Bad parameters: '+errorMessage);
        response.status(400);
    } else {
        let ds: DataStore  = new DataStore();
        ds.getTaskLists(queryString,skip,limit).then(tlists => {
            response.status(200);
            response.json(tlists);
        });
    }
});

app.post('/api/lists/', (request, response) => {
    const resp: string = 'route post: /api/lists/';
    response.json(resp);
});

app.get('/api/list/:listId', (request, response) => {
    let listId: string = request.param('listId');
    let ds: DataStore = new DataStore();
    ds.getTaskListById(listId).then(tlists => {
        response.json(tlists);
    })
});

app.post('/api/list/:listId/tasks', (request, response) => {
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