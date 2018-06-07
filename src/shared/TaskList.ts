import { Task } from '../shared/Task';

export class TaskList {
  id: string;   // uuid
  name: string;
  tasks: Task[];
  constructor() {
    this.tasks = new Array<Task>();
  }
}
