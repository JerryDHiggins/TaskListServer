
export class Task {
    id: string; // uuid
    name: string;
    completed: boolean;
    static validate(task: Task) : boolean {
      if(!task.hasOwnProperty('name')) return false;
      if(!task.hasOwnProperty('id')) return false; 
      if(!task.hasOwnProperty('completed')) return false;
      
      return true;
    }
  }