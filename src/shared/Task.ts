import { isv4UUID } from './util';

export class Task {
    id: string; // uuid
    name: string;
    completed: boolean;
    static validate(task: Task) : boolean {
      if(!task.hasOwnProperty('name')) return false;
      if(!task.hasOwnProperty('id')) return false; 
      if(!task.hasOwnProperty('completed')) return false;
      if(!isv4UUID.test(task.id)) {
        return false;
      } else {
        return true;
      }
    }
  }