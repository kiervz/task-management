import type { User } from './user';

export interface Project {
  id: string;
  code: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'on_hold' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  start_date: string;
  end_date: string;
  created_by: User;
  total_tasks: number;
  completed_tasks: number;
  in_progress_tasks: number;
  team_members: number;
  created_at: string;
  updated_at: string;
  deleted_at: boolean;
}
