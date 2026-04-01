import type { User } from './user';

interface Assignee {
  id: string;
  assigned_at: string;
  user: User;
}

interface Project {
  id: string;
  code: string;
  name: string;
}

export interface TaskMeta {
  id: string;
  code: string;
  name: string;
  color: string;
  is_default: boolean;
  sort_order: number;
}

export type TaskType = TaskMeta;
export interface TaskStatus extends TaskMeta {
  is_done: boolean;
}
export type TaskPriority = TaskMeta;

export interface Task {
  id: string;
  project_id: string;
  creator: User;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
  updated_at: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  comments_count: number;
  project: Project;
  assignees: Assignee[];
  permissions?: {
    can_manage: boolean;
  };
}
