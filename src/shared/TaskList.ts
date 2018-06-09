import { Task } from '../shared/Task';
import { isv4UUID } from './util';

export class TaskList {
  id: string;   // uuid
  name: string;
  tasks: Task[];
  constructor() {
    this.tasks = new Array<Task>();
  }
  static validateIDs(taskList: TaskList) : boolean {
    if (!isv4UUID.test(taskList.id)) return false;
    for(let i: number = 0; i < taskList.tasks.length; i++) {
      if(!Task.validateID(taskList.tasks[i])) {
        return false;
      }
    }
    return true;
  }
}
// Define Task JSON Schema
export const TaskListSchema = {
  type: 'object',
  required: ['id', 'name'],
  properties: {
      id: {
          type: 'string'
      },
      name: {
          type: 'string'
      },
      type: 'array',
      tasks: [{
          type: 'string'
        },
        {
          type: 'string'
        },
        {
          type: 'boolean'
        }
      ]
  }
}
