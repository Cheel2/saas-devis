/**
 * Interface représentant une tâche dans le système.
 */
export interface Task {
  id: string;
  title: string;
  description: string;
  done: boolean;
  createdAt: Date;
}
