import {
  Layers,
  CheckCircle,
  Users,
  Settings,
  Calendar1,
  ChartColumn,
  CalendarX,
  SwatchBook,
} from 'lucide-react';

export const STAT_CARDS = [
  {
    value: 'total_tasks',
    label: 'Total Tasks',
    icon: Layers,
  },
  {
    value: 'completed_tasks',
    label: 'Completed Tasks',
    icon: CheckCircle,
  },
  {
    value: 'overdue_tasks',
    label: 'Overdue Tasks',
    icon: CalendarX,
  },
  {
    value: 'total_members',
    label: 'Total Members',
    icon: Users,
  },
] as const;

export const TAB_LIST = [
  {
    value: 'tasks',
    label: 'Tasks',
    icon: Layers,
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: Calendar1,
  },
  {
    value: 'analytics',
    label: 'Analytics',
    icon: ChartColumn,
  },
  {
    value: 'catalogs',
    label: 'Catalogs',
    icon: SwatchBook,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: Settings,
  },
] as const;

export const STATUS_OPTIONS = [
  { label: 'Backlog', value: 'backlog' },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in-progress' },
  { label: 'Review', value: 'review' },
  { label: 'Done', value: 'done' },
];

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export const LABEL_OPTIONS = [
  { label: 'Task', value: 'task' },
  { label: 'Feature', value: 'feature' },
  { label: 'Bug', value: 'bug' },
  { label: 'Improvement', value: 'improvement' },
  { label: 'Chore', value: 'chore' },
];

export const FACETED_FILTERS = [
  { columnId: 'type', title: 'Type', options: LABEL_OPTIONS },
  { columnId: 'status', title: 'Status', options: STATUS_OPTIONS },
  { columnId: 'priority', title: 'Priority', options: PRIORITY_OPTIONS },
];
