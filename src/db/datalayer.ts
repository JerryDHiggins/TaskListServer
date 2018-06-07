import { TaskList } from '../shared/TaskList';
import { Task } from '../shared/Task';
var UUID = require('uuid-js');

// todo: no reason to convert results from string to an array  below... extra step. 
// as little transformation as possible for performance.

// todo: what to do with errors from the database

export class DataStore {
    dbConnectionStr:string = 'mongodb://localhost:27017/ToDo';

    getTaskLists(searchString: string, skip: number, limit: number): Promise<Array<TaskList>> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<Array<TaskList>>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (err) throw err;
                let db = client.db('ToDo')
                if(!limit) { limit=20000000; }
                if(!skip) { skip=0; }

                db.collection('TaskLists').createIndex({
                    name: "text",
                });
                
                if (searchString) {
                    db.collection('TaskLists').find({"$text": {"$search": searchString }}).limit(limit).skip(skip).toArray(function (err, result) {
                        if (err) throw err
                        resolve(result);
                    });
                } else {
                    db.collection('TaskLists').find().limit(limit).skip(skip).toArray(function (err, result) {
                        if (err) throw err
                        resolve(result);                   
                    });
                }
            });
        });
    }

    getTaskListById(taskListId: string): Promise<Array<TaskList>> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<Array<TaskList>>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (err) throw err;
    
                let db = client.db('ToDo');
                
                db.collection('TaskLists').find({'id': taskListId}).toArray(function (err, result) {
                    if (err) throw err
                    resolve(result);
                })
            });
        });
    }

    createTaskList(taskList: TaskList) : Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<string>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (err) throw err;
                let db = client.db('ToDo');
                let str = taskList.id;
                let ds: DataStore  = new DataStore();
                ds.getTaskListById(taskList.id).then( tlists => {
                //     if(tlists.length == 0) { // no duplicate found
                //         // db.collection('TaskList').insert(taskList);
                //         resolve('success');
                //     }
                //     reject('duplicate list found for id: ' + taskList.id);
                    let len: number = tlists.length;
                    if(tlists.length === 0) {
                        db.collection('TaskLists').insert(taskList);
                        resolve('success');
                    } else {
                        reject('duplicate exists with id: '+taskList.id);
                    }
                });
             });
        });
    }

    createTaskLists() : string {        // utility for creating records...
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