import { isv4UUID } from './util';

export class Task {
  id: string; // uuid
  name: string;
  completed: boolean;

  static validateID(task: Task) : boolean {
    return isv4UUID.test(task.id);
  }
}

  // Define Task JSON Schema
export const TaskSchema = {
  type: 'object',
  required: ['id', 'name', 'completed'],
  properties: {
      id: {
          type: 'string'
      },
      name: {
          type: 'string'
      },
      completed: {
          type: 'boolean'
      }
  }
}