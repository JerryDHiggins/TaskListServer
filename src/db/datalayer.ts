import { TaskList } from '../shared/TaskList';
import { Task } from '../shared/Task';
import { isIntString, isv4UUID } from '../shared/util';

var UUID = require('uuid-js');

let MONGO_LOCAL_URI: string = 'mongodb://localhost:27017/todolist';

let dbname: string = 'todolist';
let db;
let isDbAttached = false;
class dbMessage {
    static errcantconn: string = 'unable to connect to database';
    static errnoconn: string = 'database not connected';
    static conn: string = 'database connected';
};

export class DataStore {
    dbConnectionStr: string = MONGO_LOCAL_URI;
   
    connectDb(): Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        return new Promise<string>((resolve, reject) => {
            MongoClient.connect(this.dbConnectionStr, function (err, client) {
                if (!err) {
                    db = client.db(dbname);
                    if(err) {
                        reject(dbMessage.errcantconn);
                     } else {
                        isDbAttached = true;
                        resolve(dbMessage.conn);
                     }
                }
               });
        });
    }
    
    getTaskLists(searchString: string, skip: number, limit: number): Promise<Array<TaskList>> {
        return new Promise<Array<TaskList>>((resolve, reject) => {
                if ((isDbAttached) && (db.serverConfig.isConnected())) {
                    if(!limit) { limit=20000000; }  // TODO: Magic, should do something better
                    if(!skip) { skip=0; }

                    // Note that the createIndex will only create a new index if it does not already exist
                    db.collection('TaskLists').createIndex({
                        name: "text",
                    });
            
                    if (searchString) {
                        db.collection('TaskLists').find({"$text": {"$search": searchString }}).limit(limit).skip(skip).toArray(function (err, result) {
                            if (!err) {
                                    resolve(result);
                                } else {
                                    reject(err);
                                }
                        })
                        // .catch(err => {
                        //     reject(err);
                        // });
                    } else {
                        db.collection('TaskLists').find().limit(limit).skip(skip).toArray(function (err, result) {
                            if (!err) {
                                    resolve(result);
                                } else {
                                    reject(err);
                                }               
                        })
                    }
                } else {
                    reject(dbMessage.errnoconn);
                }
        });
    }

    getTaskListById(taskListId: string): Promise<Array<TaskList>> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<Array<TaskList>>((resolve, reject) => {
                let err=null;
                if ((isDbAttached) && (db.serverConfig.isConnected())) {
                    db.collection('TaskLists').find({'id': taskListId}).toArray(function (err, result) {
                        if (!err) {
                            resolve(result);
                        } else {
                            reject(err);
                        }
                    })
                } else {
                    reject(dbMessage.errnoconn);
                }
            });
    }

    createTaskList(taskList: TaskList) : Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<string>((resolve, reject) => {
            if ((isDbAttached) && (db.serverConfig.isConnected())) {
                this.getTaskListById(taskList.id)
                    .then( tlists => {
                        let len: number = tlists.length;
                        if(tlists.length === 0) {
                            db.collection('TaskLists').insert(taskList);
                            resolve('success');
                        } else {
                            reject('aborting as duplicate list exists with id: '+taskList.id);
                        }
                });
            } else {
                reject(dbMessage.errnoconn);
            }
        });
    }

    createTask(listId: string, task: Task) : Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        let resultStr: string;
        
        return new Promise<string>((resolve, reject) => {
            if ((isDbAttached) && (db.serverConfig.isConnected())) {
                this.getTaskListById(listId)
                    .then( tlists => {
                        let len: number = tlists.length;
                        if(tlists.length === 0) {
                            reject('List ' + listId + ' not found');
                        } else {
                            let isDuplicate: boolean = false;
                            for(let i: number = 0; i < tlists[0].tasks.length; i++) {
                                if(task.id === tlists[0].tasks[i].id) {
                                    isDuplicate = true;
                                }
                            }
                            if (isDuplicate) {
                                reject('aborted, duplicate task exists for id: '+task.id);
                            } else {
                                db.collection('TaskLists').updateOne({'id': listId}, {$push: {'tasks': task}});
                                resolve('success');
                            }
                        }
                })
            } else {
                reject(dbMessage.errnoconn);
            }
        });
    }
    markTaskCompleted(listId: string, taskId: string) : Promise<string> {
        let MongoClient = require('mongodb').MongoClient;
        return new Promise<string>((resolve, reject) => {
                if (isDbAttached)  {
                    this.getTaskListById(listId)
                        .then( tlists => {
                            let len: number = tlists.length;
                            if(tlists.length === 0) {
                                reject('List ' + listId + ' not found');
                            } else {
                                let isFound: boolean = false;
                                let tasks: Array<Task> = tlists[0].tasks;
                                for(let i: number = 0; i < tasks.length; i++) {
                                    if(taskId === tasks[i].id) {
                                        isFound= true;
                                        tasks[i].completed=true;
                                        db.collection('TaskLists')
                                            .update({"id": listId}, 
                                            {$set: {"tasks": tasks}});
                                        resolve('success');
                                    }
                                }
                                if (!isFound) {
                                    reject('Task '+taskId+' not found in list ' + listId);
                                }
                            }
                    })
                } else {
                    reject(dbMessage.errnoconn);
                }
        });
    }

    createTaskLists(numLists: number, numTasks: number) : string {        // utility for creating records...
        let tlists: Array<TaskList> = new Array<TaskList>();
        let t: Task;
        let tl: TaskList;

        let tasks: Array<Task> = new Array<Task>();

        for(let i: number = 0; i < numTasks; i++) {
            t = new Task();
            t.id = UUID.create().hex;
            t.name = 'task ' + i;
            t.completed = false;
            tasks.push(t);
        }

        for(let i: number = 0; i < numLists; i++ ) {
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

            let db = client.db(dbname);
            console.log('inserting task lists');
            tlists.forEach(element => {
                console.log('  inserting tasklist: ' + element.id);
                db.collection('TaskLists').insert(element);
                if (err) throw err;
            });
        });
        return JSON.stringify(tlists);
    }
}