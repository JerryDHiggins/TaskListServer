import { Task } from '../shared/Task';

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

    // roll through and validate tasks
    
    return true;
  }
}
