import { Task } from '../shared/Task';
import { isv4UUID } from './util';

export class TaskList {
  id: string;   // uuid
  name: string;
  tasks: Task[];
  constructor() {
    this.tasks = new Array<Task>();
  }
  static validate(taskList: TaskList) : boolean {
    // bonehead validation, should be a library for structural comparison
    if(!taskList.hasOwnProperty('name')) return false;
    if(!taskList.hasOwnProperty('id')) return false; 
    if(!taskList.hasOwnProperty('tasks')) return false;
    if(!isv4UUID.test(taskList.id)) return false;

    if(!isv4UUID.test(taskList.id)) return false;
    
    for(let i: number = 0; i < taskList.tasks.length; i++) {
      if(!Task.validate(taskList.tasks[i])) {
        return false;
      }
    }

    return true;
  }
}
