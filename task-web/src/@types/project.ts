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
  overdue_tasks: number;
  total_members: number;
  permissions?: {
    can_manage: boolean;
  };
  created_at: string;
  updated_at: string;
}
