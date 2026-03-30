import {
  Layers,
  CheckCircle,
  LoaderCircle,
  Users,
  ClipboardCheck,
  Settings,
  Calendar1,
  ChartColumn,
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
    value: 'in_progress_tasks',
    label: 'In Progress',
    icon: LoaderCircle,
  },
  {
    value: 'team_members',
    label: 'Team Members',
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
    value: 'reports',
    label: 'Reports',
    icon: ClipboardCheck,
  },
  {
    value: 'settings',
    label: 'Settings',
    icon: Settings,
  },
] as const;

export const STATUS_OPTIONS = [
  { label: 'Backlog', value: 'Backlog' },
  { label: 'Todo', value: 'Todo' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Review', value: 'Review' },
  { label: 'Done', value: 'Done' },
];

export const PRIORITY_OPTIONS = [
  { label: 'Low', value: 'Low' },
  { label: 'Medium', value: 'Medium' },
  { label: 'High', value: 'High' },
  { label: 'Critical', value: 'Critical' },
];

export const LABEL_OPTIONS = [
  { label: 'Task', value: 'Task' },
  { label: 'Feature', value: 'Feature' },
  { label: 'Bug', value: 'Bug' },
  { label: 'Improvement', value: 'Improvement' },
  { label: 'Chore', value: 'Chore' },
];

export const FACETED_FILTERS = [
  { columnId: 'label', title: 'Label', options: LABEL_OPTIONS },
  { columnId: 'status', title: 'Status', options: STATUS_OPTIONS },
  { columnId: 'priority', title: 'Priority', options: PRIORITY_OPTIONS },
];
