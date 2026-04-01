import type { User } from './user';

export interface Comment {
  id: number;
  task_id: number;
  user: User;
  content: string;
  created_at: string;
  updated_at: string;
}
