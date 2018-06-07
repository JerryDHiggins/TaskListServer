import { TaskList } from '../shared/TaskList';
import { Task } from '../shared/Task';
var UUID = require('uuid-js');

// todo: no reason to convert results from string to an array  below... extra step. 
// as little transformation as possible for performance.

export class DataStore {
    dbConnectionStr:string = 'mongodb://localhost:27017/ToDo';

    getTaskLists(searchString: string, skip: number, limit: number): Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<string>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (err) throw err;
                let db = client.db('ToDo')
                if(!searchString) { searchString=null;}
                if(!limit) { limit=null; }
                if(!skip) { skip=null; }

              db.collection('TaskLists').createIndex({
                    name: "text"
                });

                db.collection('TaskLists')
                    .find({"$text": {"$search": searchString}}).toArray(function (err, result) {

                    if (err) throw err
                    resultStr = JSON.stringify(result);
                    resolve(resultStr);
                })
            });
        });
    }
    getTaskListById(taskListId: string): Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<string>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (err) throw err;
    
                let db = client.db('ToDo');
                
                db.collection('TaskLists').find({'id': taskListId}).toArray(function (err, result) {
                    if (err) throw err
                    resultStr = JSON.stringify(result);
                    resolve(resultStr);
                })
            });
        });
    }
    createTaskLists() : string {
        let tlists: Array<TaskList> = new Array<TaskList>();
        let t: Task;
        let tl: TaskList;

        let tasks: Array<Task> = new Array<Task>();

        for(let i: number = 0; i < 20; i++) {
            t = new Task();
            t.id = UUID.create().hex;
            t.name = 'task ' + i;
            t.completed = false;
            tasks.push(t);
        }

        for(let i: number = 0; i < 10; i++ ) {
            tl = new TaskList();
            tl.name = 'List ' + i;
            tl.id = UUID.create().hex;
            tl.tasks=tasks;
            tlists.push(tl);
        }

        console.log(tlists);

        let MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(this.dbConnectionStr, function (err, client) {
            if (err) throw err;

            let db = client.db('ToDo');
            console.log('inserting task lists');
            tlists.forEach(element => {
                console.log('  inserting tasklist: ' + element.id);
                db.collection('TaskLists').insert(element);
            });
        });
        return JSON.stringify(tlists);
    }
}